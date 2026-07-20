export const ANONYMOUS_CATEGORY_SLUGS = ['anonym', 'consultation'] as const;

const ANONYMOUS_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function isAnonymousCategory(slug: string) {
	return ANONYMOUS_CATEGORY_SLUGS.includes(slug as (typeof ANONYMOUS_CATEGORY_SLUGS)[number]);
}

export function createAnonymousName() {
	const values = new Uint8Array(7);
	crypto.getRandomValues(values);
	return [...values].map((value) => ANONYMOUS_ALPHABET[value % ANONYMOUS_ALPHABET.length]).join('');
}

export function displayAuthorName(authorName: string, anonymousName: string | null) {
	return anonymousName ?? authorName;
}

export function pickAnonymousName({
	postAuthorId,
	postAnonymousName,
	commentAuthors,
	userId,
	generate = createAnonymousName
}: {
	postAuthorId: string | null;
	postAnonymousName: string | null;
	commentAuthors: Array<{ authorId: string | null; anonymousName: string | null }>;
	userId: string;
	generate?: () => string;
}) {
	if (postAuthorId === userId && postAnonymousName) return postAnonymousName;

	const previous = commentAuthors.find(
		(comment) => comment.authorId === userId && comment.anonymousName
	)?.anonymousName;
	if (previous) return previous;

	const used = new Set(commentAuthors.map((comment) => comment.anonymousName).filter(Boolean));
	if (postAnonymousName) used.add(postAnonymousName);

	let next = generate();
	while (used.has(next)) next = generate();
	return next;
}
