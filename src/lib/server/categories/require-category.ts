import { error } from '@sveltejs/kit';
import type { CategorySummary } from '$lib/categories/category';

type FindBySlug = (slug: string) => Promise<CategorySummary | undefined>;

export async function requireCategory(slug: string, findBySlug: FindBySlug) {
	const category = await findBySlug(slug);
	if (!category) error(404, '존재하지 않는 게시판입니다.');
	return category;
}
