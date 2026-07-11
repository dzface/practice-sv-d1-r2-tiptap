import { describe, expect, it } from 'vitest';
import { applyVote, canManageContent, nextClientVote, type VoteValue } from './content-actions';

describe('canManageContent', () => {
	it('allows only the author', () => {
		expect(canManageContent('user-1', 'user-1')).toBe(true);
		expect(canManageContent('user-1', 'user-2')).toBe(false);
		expect(canManageContent(null, 'user-1')).toBe(false);
	});
});

describe('applyVote', () => {
	it('adds a new upvote', () => {
		expect(applyVote({ upvoteCount: 0, downvoteCount: 0 }, null, 1)).toEqual({
			upvoteCount: 1,
			downvoteCount: 0
		});
	});

	it('moves a downvote to an upvote', () => {
		expect(applyVote({ upvoteCount: 0, downvoteCount: 1 }, -1, 1)).toEqual({
			upvoteCount: 1,
			downvoteCount: 0
		});
	});

	it('keeps counts when the same vote is repeated', () => {
		const vote: VoteValue = 1;
		expect(applyVote({ upvoteCount: 1, downvoteCount: 0 }, vote, vote)).toEqual({
			upvoteCount: 1,
			downvoteCount: 0
		});
	});

	it('removes an existing upvote', () => {
		expect(applyVote({ upvoteCount: 1, downvoteCount: 0 }, 1, null)).toEqual({
			upvoteCount: 0,
			downvoteCount: 0
		});
	});
});

describe('nextClientVote', () => {
	it('cancels the same vote', () => {
		expect(nextClientVote(1, 1)).toEqual({ vote: null });
	});

	it('blocks the opposite vote', () => {
		expect(nextClientVote(1, -1)).toEqual({ vote: 1, message: '이미 좋아요를 눌렀습니다.' });
		expect(nextClientVote(-1, 1)).toEqual({ vote: -1, message: '이미 싫어요를 눌렀습니다.' });
	});
});
