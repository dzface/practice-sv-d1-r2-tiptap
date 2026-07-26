import { getAdminDb, requireAdmin } from '$lib/server/admin/access';
import { createAdminRepository } from '$lib/server/admin/repository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = getAdminDb(platform);
	await requireAdmin(locals, db);
	return { auditLogs: await createAdminRepository(db).listAuditLogs() };
};
