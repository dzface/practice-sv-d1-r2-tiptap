import { and, asc, eq, inArray } from 'drizzle-orm';
import { commentVotes, comments, profiles } from '$lib/server/db/schema';
import type { getDb } from '$lib/server/db';
import { applyVote, type VoteValue } from '$lib/server/content-actions';

type Db = ReturnType<typeof getDb>;

export function createCommentRepository(db: Db) {
	return {
		create: async ({
			postId,
			authorId,
			authorName,
			parentCommentId,
			body
		}: {
			postId: string;
			authorId: string;
			authorName: string;
			parentCommentId?: string | null;
			body: string;
		}) => {
			await db.insert(comments).values({
				id: crypto.randomUUID(),
				postId,
				authorId,
				authorName,
				parentCommentId,
				body,
				status: 'public',
				createdAt: new Date(),
				updatedAt: new Date()
			});
		},

		listPublicByPost: (postId: string) =>
			db
				.select({
					id: comments.id,
					authorId: comments.authorId,
					authorName: comments.authorName,
					authorPoints: profiles.points,
					parentCommentId: comments.parentCommentId,
					body: comments.body,
					upvoteCount: comments.upvoteCount,
					downvoteCount: comments.downvoteCount,
					status: comments.status,
					createdAt: comments.createdAt
				})
				.from(comments)
				.leftJoin(profiles, eq(profiles.userId, comments.authorId))
				.where(and(eq(comments.postId, postId), inArray(comments.status, ['public', 'deleted'])))
				.orderBy(asc(comments.createdAt)),

		findPublicInPost: async ({ commentId, postId }: { commentId: string; postId: string }) => {
			const [comment] = await db
				.select({ id: comments.id, authorName: comments.authorName })
				.from(comments)
				.where(
					and(
						eq(comments.id, commentId),
						eq(comments.postId, postId),
						eq(comments.status, 'public')
					)
				)
				.limit(1);
			return comment ?? null;
		},

		updateOwned: async ({
			commentId,
			authorId,
			body
		}: {
			commentId: string;
			authorId: string;
			body: string;
		}) => {
			const [reply] = await db
				.select({ id: comments.id })
				.from(comments)
				.where(and(eq(comments.parentCommentId, commentId), eq(comments.status, 'public')))
				.limit(1);
			if (reply) return false;

			const updated = await db
				.update(comments)
				.set({ body, updatedAt: new Date() })
				.where(
					and(
						eq(comments.id, commentId),
						eq(comments.authorId, authorId),
						eq(comments.status, 'public')
					)
				)
				.returning({ id: comments.id });
			return updated.length > 0;
		},

		deleteOwned: async ({ commentId, authorId }: { commentId: string; authorId: string }) => {
			const updated = await db
				.update(comments)
				.set({ status: 'deleted', updatedAt: new Date() })
				.where(
					and(
						eq(comments.id, commentId),
						eq(comments.authorId, authorId),
						eq(comments.status, 'public')
					)
				)
				.returning({ id: comments.id });
			return updated.length > 0;
		},

		vote: async ({
			commentId,
			userId,
			value
		}: {
			commentId: string;
			userId: string;
			value: VoteValue | null;
		}) => {
			const [comment] = await db
				.select({
					upvoteCount: comments.upvoteCount,
					downvoteCount: comments.downvoteCount
				})
				.from(comments)
				.where(and(eq(comments.id, commentId), eq(comments.status, 'public')))
				.limit(1);
			if (!comment) return false;

			const [previous] = await db
				.select({ id: commentVotes.id, value: commentVotes.value })
				.from(commentVotes)
				.where(and(eq(commentVotes.commentId, commentId), eq(commentVotes.userId, userId)))
				.limit(1);
			if (previous?.value === value) return true;

			const next = applyVote(comment, (previous?.value as VoteValue | undefined) ?? null, value);
			await db
				.update(comments)
				.set({ ...next, updatedAt: new Date() })
				.where(eq(comments.id, commentId));

			if (previous && value === null) {
				await db.delete(commentVotes).where(eq(commentVotes.id, previous.id));
			} else if (previous) {
				await db
					.update(commentVotes)
					.set({ value: value as VoteValue, updatedAt: new Date() })
					.where(eq(commentVotes.id, previous.id));
			} else if (value !== null) {
				await db.insert(commentVotes).values({
					id: crypto.randomUUID(),
					commentId,
					userId,
					value,
					createdAt: new Date(),
					updatedAt: new Date()
				});
			}
			return true;
		},

		getUserVote: async ({ commentId, userId }: { commentId: string; userId: string }) => {
			const [vote] = await db
				.select({ value: commentVotes.value })
				.from(commentVotes)
				.where(and(eq(commentVotes.commentId, commentId), eq(commentVotes.userId, userId)))
				.limit(1);
			return (vote?.value as VoteValue | undefined) ?? null;
		}
	};
}
