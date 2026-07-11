export type VoteValue = -1 | 1;
export type StoredVoteValue = VoteValue | null;

type VoteCounts = {
	upvoteCount: number;
	downvoteCount: number;
};

export function canManageContent(
	userId: string | null | undefined,
	authorId: string | null | undefined
) {
	return Boolean(userId && authorId && userId === authorId);
}

export function applyVote(
	counts: VoteCounts,
	previousVote: StoredVoteValue,
	nextVote: StoredVoteValue
) {
	if (previousVote === nextVote) return counts;

	return {
		upvoteCount: counts.upvoteCount + (nextVote === 1 ? 1 : 0) - (previousVote === 1 ? 1 : 0),
		downvoteCount: counts.downvoteCount + (nextVote === -1 ? 1 : 0) - (previousVote === -1 ? 1 : 0)
	};
}

export function nextClientVote(currentVote: StoredVoteValue, clickedVote: VoteValue) {
	if (currentVote === clickedVote) return { vote: null };
	if (currentVote === 1 && clickedVote === -1) {
		return { vote: currentVote, message: '이미 좋아요를 눌렀습니다.' };
	}
	if (currentVote === -1 && clickedVote === 1) {
		return { vote: currentVote, message: '이미 싫어요를 눌렀습니다.' };
	}
	return { vote: clickedVote };
}
