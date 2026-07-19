import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { createCategoryRepository } from '$lib/server/categories/repository';
import { resolvePostAttachments } from '$lib/server/media-policy';
import { createPostRepository } from '$lib/server/posts/repository';
import { canWriteToCategory, validatePostInput } from '$lib/server/posts/write-policy';
import { createProfileRepository } from '$lib/server/profiles/repository';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	if (!locals.user) redirect(303, '/login');
	const { categories, user } = await parent();
	if (!user?.profile) redirect(303, '/profile/setup');

	const writableCategories = categories.filter((category) =>
		canWriteToCategory({ slug: category.slug })
	);
	const selectedCategory =
		writableCategories.find((category) => category.slug === url.searchParams.get('category')) ??
		writableCategories[0] ??
		null;

	return { writableCategories, selectedCategory };
};

export const actions: Actions = {
	default: async ({ locals, platform, request }) => {
		if (!locals.user) redirect(303, '/login');
		if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
		if (!platform.env.FILES) throw new Error('R2 binding "FILES" not found');

		const db = getDb(platform.env.DB);
		const form = await request.formData();
		const categorySlug = String(form.get('category') ?? '');
		const category = await createCategoryRepository(db).findActiveBySlug(categorySlug);

		if (!category || !canWriteToCategory({ slug: category.slug })) {
			return fail(400, { message: '글을 작성할 수 없는 게시판입니다.' });
		}

		const profile = await createProfileRepository(db).findByUserId(locals.user.id);

		if (!profile) redirect(303, '/profile/setup');

		const uploaded = await resolvePostAttachments({
			body: String(form.get('body') ?? ''),
			bucket: platform.env.FILES,
			form,
			userId: locals.user.id
		});
		const input = validatePostInput({ title: form.get('title'), body: uploaded.body });
		if (!input.ok) {
			return fail(400, {
				message: input.message,
				title: String(form.get('title') ?? ''),
				body: String(form.get('body') ?? ''),
				category: category.slug
			});
		}

		const postId = await createPostRepository(db).create({
			categoryId: category.id,
			authorId: locals.user.id,
			authorName: profile.nickname,
			title: input.title,
			body: input.body,
			attachments: uploaded.attachments
		});

		redirect(303, `/${category.slug}/${postId}`);
	}
};
