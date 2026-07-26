import { fail, redirect } from '@sveltejs/kit';
import { isContentAdminAction } from '$lib/server/admin-policy';
import { getAdminDb, requireAdmin } from '$lib/server/admin/access';
import { createAdminRepository, reasonText } from '$lib/server/admin/repository';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = getAdminDb(platform);
	await requireAdmin(locals, db);
	return { posts: await createAdminRepository(db).listPosts() };
};

export const actions: Actions = {
	moderatePost: async ({ locals, platform, request }) => {
		const db = getAdminDb(platform);
		const { userId } = await requireAdmin(locals, db);
		const form = await request.formData();
		const action = String(form.get('action') ?? '');
		const postId = String(form.get('postId') ?? '');
		if (!postId || !isContentAdminAction(action)) {
			return fail(400, { message: '잘못된 게시글 관리 요청입니다.' });
		}

		const ok = await createAdminRepository(db).moderatePost({
			postId,
			actorUserId: userId,
			action,
			reason: reasonText(form.get('reason'))
		});
		if (!ok) return fail(404, { message: '게시글을 찾을 수 없습니다.' });
		redirect(303, '/admin/posts');
	}
};
