import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { createPointSettingsRepository } from '$lib/server/points/settings';
import { validateNickname } from '$lib/server/profiles/nickname';
import { canUseNickname } from '$lib/server/profiles/nickname-update';
import { createProfileRepository } from '$lib/server/profiles/repository';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent, platform }) => {
	if (!locals.user) redirect(303, '/login');
	const { user } = await parent();
	if (!user?.profile) redirect(303, '/profile/setup');
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');

	const pointSettings = await createPointSettingsRepository(getDb(platform.env.DB)).find();
	return {
		profile: user.profile,
		pointName: pointSettings.pointName
	};
};

export const actions: Actions = {
	updateNickname: async ({ locals, platform, request }) => {
		if (!locals.user) redirect(303, '/login');
		if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');

		const db = getDb(platform.env.DB);
		const profiles = createProfileRepository(db);
		const currentProfile = await profiles.findByUserId(locals.user.id);
		if (!currentProfile) redirect(303, '/profile/setup');

		const form = await request.formData();
		const result = validateNickname(form.get('nickname'));
		if (!result.ok) return fail(400, { form: 'nickname', message: result.message });

		const taken = await profiles.isNicknameTaken(result.nickname);
		if (
			!canUseNickname({
				currentNickname: currentProfile.nickname,
				nextNickname: result.nickname,
				taken
			})
		) {
			return fail(400, { form: 'nickname', message: '이미 사용 중인 닉네임입니다.' });
		}

		await profiles.updateNickname({ userId: locals.user.id, nickname: result.nickname });
		return { form: 'nickname', message: '닉네임을 변경했습니다.' };
	},

	deleteAccount: async ({ locals, platform, request }) => {
		if (!locals.user) redirect(303, '/login');
		if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');

		const form = await request.formData();
		if (String(form.get('confirm') ?? '').trim() !== '탈퇴') {
			return fail(400, { form: 'delete', message: '탈퇴를 입력해야 회원탈퇴가 됩니다.' });
		}

		await createProfileRepository(getDb(platform.env.DB)).deleteAccount(locals.user.id);
		redirect(303, '/');
	}
};
