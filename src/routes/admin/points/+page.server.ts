import { fail } from '@sveltejs/kit';
import { canManageUsers } from '$lib/server/admin-policy';
import { getAdminDb, requireAdmin } from '$lib/server/admin/access';
import {
	createPointSettingsRepository,
	parsePointSettingsForm,
	pointEventDefaults
} from '$lib/server/points/settings';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = getAdminDb(platform);
	await requireAdmin(locals, db);
	return {
		settings: await createPointSettingsRepository(db).find(),
		pointEvents: pointEventDefaults
	};
};

export const actions: Actions = {
	default: async ({ locals, platform, request }) => {
		const db = getAdminDb(platform);
		const adminUser = await requireAdmin(locals, db);
		if (!canManageUsers(adminUser.profile?.role)) {
			return fail(403, { message: '포인트 설정 저장은 admin만 가능합니다.' });
		}

		const form = await request.formData();
		await createPointSettingsRepository(db).save(parsePointSettingsForm(form));
		return { message: '포인트 설정을 저장했습니다.' };
	}
};
