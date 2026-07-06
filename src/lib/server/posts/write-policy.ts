type CategoryWritePolicy = {
	movementKind: 'standard' | 'promotion_source' | 'promotion_target' | 'worst_target';
};

type PostInputValidationResult =
	| { ok: true; title: string; body: string }
	| { ok: false; message: string };

export function canWriteToCategory(category: CategoryWritePolicy) {
	return category.movementKind === 'standard';
}

function stripHtml(html: string) {
	return html
		.replace(/<br\s*\/?>/gi, '')
		.replace(/<\/p>/gi, '\n')
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/gi, ' ')
		.trim();
}

export function validatePostInput(input: {
	title: FormDataEntryValue | string | null;
	body: FormDataEntryValue | string | null;
}): PostInputValidationResult {
	const title = String(input.title ?? '').trim();
	const body = String(input.body ?? '').trim();

	if (!title) return { ok: false, message: '제목을 입력해 주세요.' };
	if (title.length > 120) return { ok: false, message: '제목은 120자 이하로 입력해 주세요.' };
	if (!stripHtml(body)) return { ok: false, message: '본문을 입력해 주세요.' };

	return { ok: true, title, body };
}
