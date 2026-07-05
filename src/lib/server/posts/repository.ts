import { and, desc, eq, lte, sql } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import type { CategorySummary } from '$lib/categories/category';
import { groupHomePosts } from './home-posts';

type Db = ReturnType<typeof getDb>;

export function createPostRepository(db: Db) {
	return {
		findPublicById: async (categoryId: string, postId: string) => {
			const [post] = await db
				.select({
					id: posts.id,
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
