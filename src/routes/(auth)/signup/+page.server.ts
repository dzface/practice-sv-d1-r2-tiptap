import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { validateNickname } from '$lib/server/profiles/nickname';
import { createProfileRepository } from '$lib/server/profiles/repository';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) redirect(303, '/login');
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');

	const profile = await createProfileRepository(getDb(platform.env.DB)).findByUserId(
		locals.user.id
	);
	if (profile) redirect(303, '/');
};

export const actions: Actions = {
	default: async ({ locals, platform, request }) => {
		if (!locals.user) redirect(303, '/login');
		if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');

		const form = await request.formData();
		if (form.get('policy') !== 'on' || form.get('privacy') !== 'on') {
			return fail(400, {
				message: '약관과 개인정보처리방침에 모두 동의해 주세요.',
				nickname: String(form.get('nickname') ?? '')
			});
		}

		const result = validateNickname(form.get('nickname'));
		if (!result.ok)
			return fail(400, { message: result.message, nickname: String(form.get('nickname') ?? '') });

		const profiles = createProfileRepository(getDb(platform.env.DB));
		if (await profiles.findByUserId(locals.user.id)) redirect(303, '/');

		if (await profiles.isNicknameTaken(result.nickname)) {
			return fail(400, { message: '이미 사용 중인 닉네임입니다.', nickname: result.nickname });
		}

		await profiles.create({ userId: locals.user.id, nickname: result.nickname });
		redirect(303, '/');
	}
};
