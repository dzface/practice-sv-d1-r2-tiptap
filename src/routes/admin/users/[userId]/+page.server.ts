import { error, fail, redirect } from '@sveltejs/kit';
import { canManageUsers } from '$lib/server/admin-policy';
import { getAdminDb, requireAdmin } from '$lib/server/admin/access';
import { createAdminRepository } from '$lib/server/admin/repository';
import type { Actions, PageServerLoad } from './$types';

const statuses = ['active', 'suspended'] as const;
type UserStatus = (typeof statuses)[number];

function parseSuspendedUntil(value: FormDataEntryValue | null, status: UserStatus) {
	if (status === 'active') return null;
	const raw = String(value ?? '').trim();
	if (!raw) return null;
	const date = new Date(raw);
	return Number.isNaN(date.getTime()) ? null : date;
}

export const load: PageServerLoad = async ({ locals, params, platform }) => {
	const db = getAdminDb(platform);
	await requireAdmin(locals, db);
	const user = await createAdminRepository(db).findUser(params.userId);
	if (!user) error(404, '회원을 찾을 수 없습니다.');
	return { user, statuses };
};

export const actions: Actions = {
	default: async ({ locals, params, platform, request }) => {
		const db = getAdminDb(platform);
		const adminUser = await requireAdmin(locals, db);
		if (!canManageUsers(adminUser.profile?.role)) {
			return fail(403, { message: '회원 정보 수정은 admin만 가능합니다.' });
		}

		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const name = String(form.get('name') ?? '').trim();
		const nickname = String(form.get('nickname') ?? '').trim();
		const status = String(form.get('status') ?? '') as UserStatus;
		const suspendedUntil = parseSuspendedUntil(form.get('suspendedUntil'), status);
		const adminMemo = String(form.get('adminMemo') ?? '').trim();
		if (!email || !name || !nickname || !statuses.includes(status))
			return fail(400, { message: '필수 항목을 입력해주세요.' });

		const ok = await createAdminRepository(db).updateUserProfile({
			userId: params.userId,
			actorUserId: adminUser.userId,
			email,
			name,
			nickname,
			status,
			suspendedUntil,
			adminMemo
		});
		if (!ok) return fail(404, { message: '회원을 찾을 수 없습니다.' });
		redirect(303, '/admin/users');
	}
};
