import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function safeDownloadName(value: string | null, fallback: string) {
	return (value || fallback).replace(/["\r\n]/g, '').slice(0, 120) || 'file';
}

export const GET: RequestHandler = async ({ params, platform, url }) => {
	if (!platform?.env.FILES) throw new Error('R2 binding "FILES" not found');

	const object = await platform.env.FILES.get(params.key);
	if (!object) error(404, '파일을 찾을 수 없습니다.');

	const headers = new Headers();
	if (object.httpMetadata?.contentType)
		headers.set('content-type', object.httpMetadata.contentType);
	headers.set('etag', object.httpEtag);
	headers.set('cache-control', 'public, max-age=31536000, immutable');

	if (url.searchParams.get('download') === '1') {
		const fallback = params.key.split('/').at(-1) ?? 'file';
		const name = safeDownloadName(url.searchParams.get('name'), fallback);
		headers.set('content-disposition', `attachment; filename="${name}"`);
	}

	return new Response(object.body, { headers });
};
