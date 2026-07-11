type CommentInputValidationResult = { ok: true; body: string } | { ok: false; message: string };

export function validateCommentInput(
	body: FormDataEntryValue | string | null
): CommentInputValidationResult {
	const text = String(body ?? '').trim();
	if (!text) return { ok: false, message: '댓글을 입력해 주세요.' };
	if (text.length > 1000) return { ok: false, message: '댓글은 1000자 이하로 입력해 주세요.' };
	return { ok: true, body: text };
}
