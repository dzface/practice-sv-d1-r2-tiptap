import { error, redirect } from '@sveltejs/kit';
import { canAccessAdmin } from '$lib/server/admin-policy';
import { getDb } from '$lib/server/db';
import { createProfileRepository } from '$lib/server/profiles/repository';

export function getAdminDb(platform: App.Platform | undefined) {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
	return getDb(platform.env.DB);
}

export async function requireAdmin(locals: App.Locals, db: ReturnType<typeof getDb>) {
	if (!locals.user) redirect(303, '/login');
	const profile = await createProfileRepository(db).findByUserId(locals.user.id);
	if (!canAccessAdmin(profile?.role)) error(403, '관리 권한이 없습니다.');
	return { userId: locals.user.id, name: locals.user.name, profile };
}
