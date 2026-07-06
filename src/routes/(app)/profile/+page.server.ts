import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	if (!locals.user) redirect(303, '/login');
	const { user } = await parent();
	if (!user?.profile) redirect(303, '/profile/setup');
	return {
		profile: user.profile
	};
};
