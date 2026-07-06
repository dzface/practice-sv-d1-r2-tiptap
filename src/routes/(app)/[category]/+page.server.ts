import { createCategoryRepository } from '$lib/server/categories/repository';
import { requireCategory } from '$lib/server/categories/require-category';
import { getDb } from '$lib/server/db';
import { canWriteToCategory } from '$lib/server/posts/write-policy';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
	const repository = createCategoryRepository(getDb(platform.env.DB));
	const category = await requireCategory(params.category, repository.findActiveBySlug);
	return {
		category,
		canWrite: canWriteToCategory({ movementKind: category.movementKind ?? 'standard' })
	};
};
