type CategoryWritePolicy = {
	slug: string;
};

type PostInputValidationResult =
	{ ok: true; title: string; body: string } | { ok: false; message: string };

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
	'h4',
	'h5',
	'h6',
	'a',
	'u',
	'sub',
	'sup',
	'hr',
	'img',
	'video',
	'source',
	'iframe',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td',
	'span'
]);

const styleTags = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'th', 'td', 'img']);

function readAttribute(attributes: string, name: string) {
	const match = attributes.match(new RegExp(`\\s${name}=(["'])(.*?)\\1`, 'i'));
	return match?.[2]?.trim();
}

function escapeAttribute(value: string) {
	return value.replace(/"/g, '&quot;');
}

function sanitizeStyle(rawStyle: string) {
	const allowed = new Set([
		'color',
		'background-color',
		'font-family',
		'font-size',
		'text-align',
		'width'
	]);
	const styles = rawStyle
		.split(';')
		.map((entry) => entry.trim())
		.filter(Boolean)
		.flatMap((entry) => {
			const [property, ...valueParts] = entry.split(':');
			const key = property?.trim().toLowerCase();
			const value = valueParts.join(':').trim();
			if (!allowed.has(key) || !value || /url|expression|javascript/i.test(value)) return [];
			return [`${key}:${value}`];
		});
	return styles.length ? ` style="${escapeAttribute(styles.join(';'))}"` : '';
}

function isSafeUrl(value: string) {
	return /^https?:\/\//i.test(value);
}

function isSafeMediaUrl(value: string) {
	return isSafeUrl(value) || value.startsWith('/media/file/');
}

function isSafeYoutubeEmbed(value: string) {
	return /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\/[a-zA-Z0-9_-]+/i.test(
		value
	);
}

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
			const rawStyle = readAttribute(String(rawAttributes), 'style') ?? '';
			const style = styleTags.has(tag) ? sanitizeStyle(rawStyle) : '';

			if (tag === 'a') {
				const href = readAttribute(String(rawAttributes), 'href');
				if (!href || !isSafeUrl(href)) return '<a>';
				return `<a href="${escapeAttribute(href)}" rel="nofollow noopener noreferrer" target="_blank">`;
			}
			if (tag === 'img') {
				const src = readAttribute(String(rawAttributes), 'src');
				if (!src || !isSafeMediaUrl(src)) return '';
				const alt = readAttribute(String(rawAttributes), 'alt');
				return `<img src="${escapeAttribute(src)}"${alt ? ` alt="${escapeAttribute(alt)}"` : ''}${style}>`;
			}
			if (tag === 'video') {
				const src = readAttribute(String(rawAttributes), 'src');
				if (!src || !isSafeMediaUrl(src)) return '';
				return `<video controls src="${escapeAttribute(src)}">`;
			}
			if (tag === 'source') {
				const src = readAttribute(String(rawAttributes), 'src');
				const type = readAttribute(String(rawAttributes), 'type');
				if (!src || !isSafeMediaUrl(src)) return '';
				return `<source src="${escapeAttribute(src)}"${type ? ` type="${escapeAttribute(type)}"` : ''}>`;
			}
			if (tag === 'iframe') {
				const src = readAttribute(String(rawAttributes), 'src');
				if (!src || !isSafeYoutubeEmbed(src)) return '';
				const width = readAttribute(String(rawAttributes), 'width');
				const height = readAttribute(String(rawAttributes), 'height');
				const title = readAttribute(String(rawAttributes), 'title');
				const frameborder = readAttribute(String(rawAttributes), 'frameborder');
				const allow = readAttribute(String(rawAttributes), 'allow');
				const referrerpolicy = readAttribute(String(rawAttributes), 'referrerpolicy');
				const allowfullscreen = readAttribute(String(rawAttributes), 'allowfullscreen');
				return `<iframe src="${escapeAttribute(src)}"${width ? ` width="${escapeAttribute(width)}"` : ''}${height ? ` height="${escapeAttribute(height)}"` : ''}${title ? ` title="${escapeAttribute(title)}"` : ''}${frameborder ? ` frameborder="${escapeAttribute(frameborder)}"` : ''}${allow ? ` allow="${escapeAttribute(allow)}"` : ''}${referrerpolicy ? ` referrerpolicy="${escapeAttribute(referrerpolicy)}"` : ''}${allowfullscreen !== null ? ' allowfullscreen="true"' : ''}>`;
			}
			return `<${tag}${style}>`;
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
