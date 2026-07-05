import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { createCategoryRepository } from '$lib/server/categories/repository';
import { requireCategory } from '$lib/server/categories/require-category';
import { createPostRepository } from '$lib/server/posts/repository';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
	const db = getDb(platform.env.DB);
	const category = await requireCategory(
		params.category,
		createCategoryRepository(db).findActiveBySlug
	);
	const post = await createPostRepository(db).findPublicById(category.id, params.postId);
	if (!post) error(404, '게시글을 찾을 수 없습니다.');
	return { category, post };
};
