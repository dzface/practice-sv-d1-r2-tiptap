import { describe, expect, it } from 'vitest';
import { toCategoryPostItems } from './category-posts';

describe('게시판 글 목록', () => {
	it('최신순으로 글 목록 항목을 만든다', () => {
		const posts = [
			{
				id: 'old',
				title: '이전 글',
				authorName: '작성자',
				viewCount: 0,
				upvoteCount: 1,
				downvoteCount: 0,
				createdAt: new Date('2026-07-01T00:00:00.000Z')
			},
			{
				id: 'new',
				title: '새 글',
				authorName: '작성자',
				viewCount: 2,
				upvoteCount: 3,
				downvoteCount: 1,
				createdAt: new Date('2026-07-02T00:00:00.000Z')
			}
		];

		expect(toCategoryPostItems(posts)).toEqual([
			{ ...posts[1], score: 2, commentCount: 0 },
			{ ...posts[0], score: 1, commentCount: 0 }
		]);
	});
});
