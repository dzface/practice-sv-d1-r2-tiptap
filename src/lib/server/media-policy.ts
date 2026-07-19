export const maxUploadBytes = 5 * 1024 * 1024;

export type PendingAttachment = {
	key: string;
	name: string;
	type: string;
	size: number;
};

type AttachmentEntry = {
	id?: string;
	key?: string;
	name?: string;
	type?: string;
	size?: number;
	url?: string;
	listed?: boolean;
};

export function isAllowedMediaType(type: string) {
	return type.startsWith('image/') || type.startsWith('video/');
}

export function userUploadPrefix(userId: string) {
	return `uploads/${userId.replace(/[^a-zA-Z0-9_-]/g, '')}/`;
}

export function mediaUrl(key: string) {
	return `/media/file/${key
		.split('/')
		.map((part) => encodeURIComponent(part))
		.join('/')}`;
}

function safeName(name: string) {
	return name.replace(/[^\w.-]+/g, '_').slice(0, 120) || 'file';
}

function parseEntries(value: FormDataEntryValue | null) {
	if (!value) return [];
	let parsed: unknown;
	try {
		parsed = JSON.parse(String(value));
	} catch {
		return [];
	}
	if (!Array.isArray(parsed)) return [];
	return parsed.filter(
		(item): item is AttachmentEntry => Boolean(item) && typeof item === 'object'
	);
}

export async function resolvePostAttachments({
	body,
	bucket,
	form,
	userId
}: {
	body: string;
	bucket: R2Bucket;
	form: FormData;
	userId: string;
}) {
	const prefix = userUploadPrefix(userId);
	const files = form.getAll('attachmentFiles').filter((file): file is File => file instanceof File);
	let fileIndex = 0;
	let resolvedBody = body;
	const attachments: PendingAttachment[] = [];

	for (const entry of parseEntries(form.get('attachments'))) {
		if (entry.key) {
			const key = String(entry.key);
			const name = String(entry.name ?? '').trim();
			const type = String(entry.type ?? '');
			const size = Number(entry.size ?? 0);
			if (!key.startsWith(prefix) || !name || !isAllowedMediaType(type)) continue;
			if (!Number.isFinite(size) || size <= 0 || size > maxUploadBytes) continue;
			if (entry.listed !== false) attachments.push({ key, name, type, size });
			continue;
		}

		const file = files[fileIndex++];
		if (!file || file.size > maxUploadBytes || !isAllowedMediaType(file.type)) continue;

		const name = safeName(file.name);
		const key = `${prefix}${crypto.randomUUID()}-${name}`;
		await bucket.put(key, await file.arrayBuffer(), {
			httpMetadata: { contentType: file.type }
		});

		const url = mediaUrl(key);
		if (entry.url) resolvedBody = resolvedBody.split(String(entry.url)).join(url);
		if (entry.listed !== false) attachments.push({ key, name, type: file.type, size: file.size });
	}

	return { body: resolvedBody, attachments };
}
