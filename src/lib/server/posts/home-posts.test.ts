import { describe, expect, it } from 'vitest';
import { groupHomePosts } from './home-posts';

const categories = [
	{ id: 'cat_big', slug: 'big', name: '빅토끼', group: '빅토끼', groupOrder: 1, sortOrder: 1 },
	{
		id: 'trend',
		slug: 'trend',
		name: '빅토끼 인기글',
		group: '빅토끼',
		groupOrder: 1,
		sortOrder: 2
	}
];

describe('groupHomePosts', () => {
	it('모든 게시판을 유지하고 게시판별 최신글을 10개로 제한한다', () => {
		const posts = Array.from({ length: 11 }, (_, index) => ({
			id: `post-${index + 1}`,
			categoryId: 'cat_big',
			title: `글 ${index + 1}`,
			viewCount: index,
			upvoteCount: index,
			downvoteCount: 0,
			createdAt: new Date(`2026-07-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`)
		}));

		const result = groupHomePosts(categories, posts, 10);

		expect(result).toHaveLength(2);
		expect(result[0].posts).toHaveLength(10);
		expect(result[0].posts[0].id).toBe('post-11');
		expect(result[0].posts.at(-1)?.id).toBe('post-2');
		expect(result[1]).toMatchObject({ id: 'trend', posts: [] });
	});
});
