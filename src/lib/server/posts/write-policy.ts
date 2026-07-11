type CategoryWritePolicy = {
	slug: string;
};

type PostInputValidationResult =
	| { ok: true; title: string; body: string }
	| { ok: false; message: string };

const blockedWriteSlugs = new Set(['big', 'trend', 'worst']);
const allowedTags = new Set([
	'p',
	'br',
	'strong',
	'b',
	'em',
	'i',
	's',
	'code',
	'pre',
	'blockquote',
	'ul',
	'ol',
	'li',
	'h1',
	'h2',
	'h3',
	'a'
]);

export function canWriteToCategory(category: CategoryWritePolicy) {
	return !blockedWriteSlugs.has(category.slug);
}

export function sanitizePostBody(html: string) {
	return html
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?<\/style>/gi, '')
		.replace(/<\/?([a-z0-9-]+)(\s[^>]*)?>/gi, (match, rawTag: string, rawAttributes = '') => {
			const tag = rawTag.toLowerCase();
			const isClosing = match.startsWith('</');
			if (!allowedTags.has(tag)) return '';
			if (isClosing) return `</${tag}>`;
			if (tag !== 'a') return `<${tag}>`;

			const hrefMatch = String(rawAttributes).match(/\shref=(["'])(.*?)\1/i);
			const href = hrefMatch?.[2]?.trim();
			if (!href || !/^https?:\/\//i.test(href)) return '<a>';
			const safeHref = href.replace(/"/g, '&quot;');
			return `<a href="${safeHref}" rel="nofollow noopener noreferrer" target="_blank">`;
		})
		.trim();
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
	const body = sanitizePostBody(String(input.body ?? '').trim());

	if (!title) return { ok: false, message: '제목을 입력해 주세요.' };
	if (title.length > 120) return { ok: false, message: '제목은 120자 이하로 입력해 주세요.' };
	if (!stripHtml(body)) return { ok: false, message: '본문을 입력해 주세요.' };

	return { ok: true, title, body };
}
