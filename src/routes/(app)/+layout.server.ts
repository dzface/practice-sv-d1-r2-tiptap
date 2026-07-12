import { groupCategories } from '$lib/categories/category';
import { createCategoryRepository } from '$lib/server/categories/repository';
import { getDb } from '$lib/server/db';
import { shouldRedirectToProfileSetup } from '$lib/server/profiles/profile-guard';
import { createProfileRepository } from '$lib/server/profiles/repository';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, platform, url }) => {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
	const db = getDb(platform.env.DB);
	const categories = await createCategoryRepository(db).listActive();
	const profile = locals.user
		? await createProfileRepository(db).findByUserId(locals.user.id)
		: null;

	if (
		shouldRedirectToProfileSetup({
			isLoggedIn: Boolean(locals.user),
			hasProfile: Boolean(profile),
			pathname: url.pathname
		})
	) {
		redirect(303, '/signup');
	}

	return {
		categories,
		categoryGroups: groupCategories(categories),
		user: locals.user
			? {
					name: locals.user.name,
					profile
				}
			: null
	};
};
