import { fail, redirect } from '@sveltejs/kit';
import { canManageUsers, type AdminRole } from '$lib/server/admin-policy';
import { getAdminDb, requireAdmin } from '$lib/server/admin/access';
import { createAdminRepository, reasonText } from '$lib/server/admin/repository';
import type { Actions, PageServerLoad } from './$types';

const roles: AdminRole[] = ['admin', 'manager', 'user'];
const statuses = ['active', 'suspended'] as const;
type UserStatus = (typeof statuses)[number];

export const load: PageServerLoad = async ({ locals, platform, url }) => {
	const db = getAdminDb(platform);
	await requireAdmin(locals, db);
	const field = url.searchParams.get('field') ?? 'id';
	const keyword = url.searchParams.get('keyword') ?? '';
	return {
		users: await createAdminRepository(db).listUsers({ field, keyword }),
		roles,
		statuses,
		search: { field, keyword }
	};
};

export const actions: Actions = {
	updateRole: async ({ locals, platform, request }) => {
		const db = getAdminDb(platform);
		const adminUser = await requireAdmin(locals, db);
		if (!canManageUsers(adminUser.profile?.role)) {
			return fail(403, { message: '회원 권한 변경은 admin만 가능합니다.' });
		}

		const form = await request.formData();
		const userId = String(form.get('userId') ?? '');
		const role = String(form.get('role') ?? '') as AdminRole;
		if (!userId || !roles.includes(role))
			return fail(400, { message: '잘못된 권한 변경 요청입니다.' });

		const ok = await createAdminRepository(db).updateUserRole({
			userId,
			actorUserId: adminUser.userId,
			role,
			reason: reasonText(form.get('reason')) || `role:${role}`
		});
		if (!ok) return fail(404, { message: '회원을 찾을 수 없습니다.' });
		redirect(303, '/admin/users');
	},

	updateStatus: async ({ locals, platform, request }) => {
		const db = getAdminDb(platform);
		const adminUser = await requireAdmin(locals, db);
		if (!canManageUsers(adminUser.profile?.role)) {
			return fail(403, { message: '회원 상태 변경은 admin만 가능합니다.' });
		}

		const form = await request.formData();
		const userId = String(form.get('userId') ?? '');
		const status = String(form.get('status') ?? '') as UserStatus;
		if (!userId || !statuses.includes(status))
			return fail(400, { message: '잘못된 상태 변경 요청입니다.' });

		const ok = await createAdminRepository(db).updateUserStatus({
			userId,
			actorUserId: adminUser.userId,
			status
		});
		if (!ok) return fail(404, { message: '회원을 찾을 수 없습니다.' });
		redirect(303, '/admin/users');
	}
};
