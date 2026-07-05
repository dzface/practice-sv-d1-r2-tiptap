import { groupCategories } from '$lib/categories/category';
import { createCategoryRepository } from '$lib/server/categories/repository';
import { getDb } from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, platform }) => {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
	const categories = await createCategoryRepository(getDb(platform.env.DB)).listActive();
	return {
		categories,
		categoryGroups: groupCategories(categories),
		user: locals.user ? { name: locals.user.name } : null
	};
};
