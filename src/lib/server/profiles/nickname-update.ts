export function canUseNickname({
	currentNickname,
	nextNickname,
	taken
}: {
	currentNickname: string;
	nextNickname: string;
	taken: boolean;
}) {
	return currentNickname === nextNickname || !taken;
}
