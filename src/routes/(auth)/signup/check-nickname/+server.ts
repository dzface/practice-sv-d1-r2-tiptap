import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { validateNickname } from '$lib/server/profiles/nickname';
import { createProfileRepository } from '$lib/server/profiles/repository';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform, url }) => {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');

	const result = validateNickname(url.searchParams.get('nickname'));
	if (!result.ok) return json({ ok: false, message: result.message });

	const taken = await createProfileRepository(getDb(platform.env.DB)).isNicknameTaken(
		result.nickname
	);
	return json({
		ok: !taken,
		message: taken ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.'
	});
};
