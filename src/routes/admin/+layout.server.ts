import { adminMenuGroups } from '$lib/server/admin-console';
import { getAdminDb, requireAdmin } from '$lib/server/admin/access';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, platform, url }) => {
	const adminUser = await requireAdmin(locals, getAdminDb(platform));

	return {
		menuGroups: adminMenuGroups,
		currentPath: url.pathname,
		adminUser: {
			name: adminUser.name,
			profile: adminUser.profile
		}
	};
};
