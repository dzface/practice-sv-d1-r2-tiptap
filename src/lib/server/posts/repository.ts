import { and, asc, count, desc, eq, lte, sql } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import { postAttachments, postVotes, posts } from '$lib/server/db/schema';
import type { CategorySummary } from '$lib/categories/category';
import { applyVote, type VoteValue } from '$lib/server/content-actions';
import type { PendingAttachment } from '$lib/server/media-policy';
import { toCategoryPostItems } from './category-posts';
import { groupHomePosts } from './home-posts';

type Db = ReturnType<typeof getDb>;

function attachmentUrl(key: string) {
	return `/media/file/${key
		.split('/')
		.map((part) => encodeURIComponent(part))
		.join('/')}`;
}

function toAttachment(row: typeof postAttachments.$inferSelect) {
	return {
		id: row.id,
		key: row.r2Key,
		name: row.fileName,
		type: row.mimeType,
		size: row.size,
		url: attachmentUrl(row.r2Key)
	};
}

export function createPostRepository(db: Db) {
	async function replaceAttachments(postId: string, attachments: PendingAttachment[]) {
		await db.delete(postAttachments).where(eq(postAttachments.postId, postId));
		if (attachments.length === 0) return;

		await db.insert(postAttachments).values(
			attachments.map((attachment) => ({
				id: crypto.randomUUID(),
				postId,
				r2Key: attachment.key,
				fileName: attachment.name,
				mimeType: attachment.type,
				size: attachment.size,
				createdAt: new Date()
			}))
		);
	}

	return {
		create: async ({
			categoryId,
			authorId,
			authorName,
			title,
			body,
			attachments = []
		}: {
			categoryId: string;
			authorId: string;
			authorName: string;
			title: string;
			body: string;
			attachments?: PendingAttachment[];
		}) => {
			const id = crypto.randomUUID();
			await db.insert(posts).values({
				id,
				categoryId,
				originalCategoryId: categoryId,
				authorId,
				authorName,
				title,
				body,
				status: 'public',
				createdAt: new Date(),
				updatedAt: new Date()
			});
			await replaceAttachments(id, attachments);
			return id;
		},

		countPublicByCategory: async (categoryId: string) => {
			const [result] = await db
				.select({ count: count() })
				.from(posts)
				.where(and(eq(posts.categoryId, categoryId), eq(posts.status, 'public')));
			return result?.count ?? 0;
		},

		listPublicByCategory: async (
			categoryId: string,
			{ limit, offset } = { limit: 20, offset: 0 }
		) => {
			const result = await db
				.select({
					id: posts.id,
					title: posts.title,
					authorName: posts.authorName,
					viewCount: posts.viewCount,
					upvoteCount: posts.upvoteCount,
					downvoteCount: posts.downvoteCount,
					createdAt: posts.createdAt
				})
				.from(posts)
				.where(and(eq(posts.categoryId, categoryId), eq(posts.status, 'public')))
				.orderBy(desc(posts.createdAt))
				.limit(limit)
				.offset(offset);

			return toCategoryPostItems(result);
		},

		findPublicById: async (categoryId: string, postId: string) => {
			await db
				.update(posts)
				.set({ viewCount: sql`${posts.viewCount} + 1` })
				.where(
					and(eq(posts.id, postId), eq(posts.categoryId, categoryId), eq(posts.status, 'public'))
				);

			const [post] = await db
				.select({
					id: posts.id,
					authorId: posts.authorId,
					title: posts.title,
					body: posts.body,
					authorName: posts.authorName,
					viewCount: posts.viewCount,
					upvoteCount: posts.upvoteCount,
					downvoteCount: posts.downvoteCount,
					createdAt: posts.createdAt
				})
				.from(posts)
				.where(
					and(eq(posts.id, postId), eq(posts.categoryId, categoryId), eq(posts.status, 'public'))
				)
				.limit(1);
			return post;
		},

		listAttachments: async (postId: string) => {
			const rows = await db
				.select()
				.from(postAttachments)
				.where(eq(postAttachments.postId, postId))
				.orderBy(asc(postAttachments.createdAt));
			return rows.map(toAttachment);
		},

		updateOwned: async ({
			postId,
			authorId,
			title,
			body,
			attachments
		}: {
			postId: string;
			authorId: string;
			title: string;
			body: string;
			attachments?: PendingAttachment[];
		}) => {
			const updated = await db
				.update(posts)
				.set({ title, body, updatedAt: new Date() })
				.where(and(eq(posts.id, postId), eq(posts.authorId, authorId), eq(posts.status, 'public')))
				.returning({ id: posts.id });
			if (updated.length > 0 && attachments) await replaceAttachments(postId, attachments);
			return updated.length > 0;
		},

		deleteOwned: async ({ postId, authorId }: { postId: string; authorId: string }) => {
			const updated = await db
				.update(posts)
				.set({ status: 'deleted', updatedAt: new Date() })
				.where(and(eq(posts.id, postId), eq(posts.authorId, authorId), eq(posts.status, 'public')))
				.returning({ id: posts.id });
			return updated.length > 0;
		},

		vote: async ({
			postId,
			userId,
			value
		}: {
			postId: string;
			userId: string;
			value: VoteValue | null;
		}) => {
			const [post] = await db
				.select({
					upvoteCount: posts.upvoteCount,
					downvoteCount: posts.downvoteCount
				})
				.from(posts)
				.where(and(eq(posts.id, postId), eq(posts.status, 'public')))
				.limit(1);
			if (!post) return false;

			const [previous] = await db
				.select({ id: postVotes.id, value: postVotes.value })
				.from(postVotes)
				.where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)))
				.limit(1);
			if (previous?.value === value) return true;

			const next = applyVote(post, (previous?.value as VoteValue | undefined) ?? null, value);
			await db
				.update(posts)
				.set({ ...next, updatedAt: new Date() })
				.where(eq(posts.id, postId));

			if (previous && value === null) {
				await db.delete(postVotes).where(eq(postVotes.id, previous.id));
			} else if (previous) {
				await db
					.update(postVotes)
					.set({ value: value as VoteValue, updatedAt: new Date() })
					.where(eq(postVotes.id, previous.id));
			} else if (value !== null) {
				await db.insert(postVotes).values({
					id: crypto.randomUUID(),
					postId,
					userId,
					value,
					createdAt: new Date(),
					updatedAt: new Date()
				});
			}
			return true;
		},

		getUserVote: async ({ postId, userId }: { postId: string; userId: string }) => {
			const [vote] = await db
				.select({ value: postVotes.value })
				.from(postVotes)
				.where(and(eq(postVotes.postId, postId), eq(postVotes.userId, userId)))
				.limit(1);
			return (vote?.value as VoteValue | undefined) ?? null;
		},

		isPublicInCategory: async (categoryId: string, postId: string) => {
			const [result] = await db
				.select({ count: count() })
				.from(posts)
				.where(
					and(eq(posts.id, postId), eq(posts.categoryId, categoryId), eq(posts.status, 'public'))
				);
			return (result?.count ?? 0) > 0;
		},

		listHomeBoards: async (categories: CategorySummary[], limit = 10) => {
			const rank = sql<number>`row_number() over (
				partition by ${posts.categoryId}
				order by ${posts.createdAt} desc
			)`.as('category_rank');
			const rankedPosts = db
				.select({
					id: posts.id,
					categoryId: posts.categoryId,
					title: posts.title,
					viewCount: posts.viewCount,
					upvoteCount: posts.upvoteCount,
					downvoteCount: posts.downvoteCount,
					createdAt: posts.createdAt,
					rank
				})
				.from(posts)
				.where(eq(posts.status, 'public'))
				.as('ranked_posts');

			const recentPosts = await db
				.select({
					id: rankedPosts.id,
					categoryId: rankedPosts.categoryId,
					title: rankedPosts.title,
					viewCount: rankedPosts.viewCount,
					upvoteCount: rankedPosts.upvoteCount,
					downvoteCount: rankedPosts.downvoteCount,
					createdAt: rankedPosts.createdAt
				})
				.from(rankedPosts)
				.where(lte(rankedPosts.rank, limit))
				.orderBy(desc(rankedPosts.createdAt));

			return groupHomePosts(categories, recentPosts, limit);
		}
	};
}
