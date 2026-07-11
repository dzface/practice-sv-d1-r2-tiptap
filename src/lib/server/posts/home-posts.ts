import type { CategorySummary } from '$lib/categories/category';

export type HomePostSource = {
	id: string;
	categoryId: string;
	title: string;
	viewCount: number;
	upvoteCount: number;
	downvoteCount: number;
	createdAt: Date;
};

export type HomePost = HomePostSource & { score: number };
export type HomePostItem = HomePostSource & { score: number; commentCount: number };

export type HomeBoard = CategorySummary & { posts: HomePostItem[] };

export function groupHomePosts(
	categories: CategorySummary[],
	posts: HomePostSource[],
	limit = 10
): HomeBoard[] {
	const postsByCategory = new Map<string, HomePostSource[]>();

	for (const post of posts) {
		const entries = postsByCategory.get(post.categoryId) ?? [];
		entries.push(post);
		postsByCategory.set(post.categoryId, entries);
	}

	return categories.map((category) => ({
		...category,
		posts: (postsByCategory.get(category.id) ?? [])
			.sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime())
			.slice(0, limit)
			.map((post) => ({
				...post,
				score: post.upvoteCount - post.downvoteCount,
				commentCount: 0
			}))
	}));
}
