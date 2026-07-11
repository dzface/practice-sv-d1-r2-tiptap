export type CategoryPostSource = {
	id: string;
	title: string;
	authorName: string;
	viewCount: number;
	upvoteCount: number;
	downvoteCount: number;
	createdAt: Date;
};

export type CategoryPostItem = CategoryPostSource & {
	score: number;
	commentCount: number;
};

export function toCategoryPostItems(posts: CategoryPostSource[]): CategoryPostItem[] {
	return [...posts]
		.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
		.map((post) => ({ ...post, score: post.upvoteCount - post.downvoteCount, commentCount: 0 }));
}
