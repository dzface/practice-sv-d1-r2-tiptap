import { createCategoryRepository } from '$lib/server/categories/repository';
import { requireCategory } from '$lib/server/categories/require-category';
import { getDb } from '$lib/server/db';
import { createPostRepository } from '$lib/server/posts/repository';
import { canWriteToCategory } from '$lib/server/posts/write-policy';
import { createPagination } from '$lib/pagination/pagination';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform, url }) => {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
	const db = getDb(platform.env.DB);
	const repository = createCategoryRepository(db);
	const category = await requireCategory(params.category, repository.findActiveBySlug);
	const postRepository = createPostRepository(db);
	const totalItems = await postRepository.countPublicByCategory(category.id);
	const page = Number(url.searchParams.get('page') ?? 1);
	const pagination = createPagination({ page, totalItems, pageSize: 20 });
	const posts = await postRepository.listPublicByCategory(category.id, {
		limit: pagination.pageSize,
		offset: (pagination.page - 1) * pagination.pageSize
	});
	return {
		category,
		canWrite: canWriteToCategory({ slug: category.slug }),
		posts,
		pagination
	};
};
