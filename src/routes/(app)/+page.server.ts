import { getDb } from '$lib/server/db';
import { createPostRepository } from '$lib/server/posts/repository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, platform }) => {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
	const { categories } = await parent();
	const boards = await createPostRepository(getDb(platform.env.DB)).listHomeBoards(categories, 10);
	return { boards };
};
