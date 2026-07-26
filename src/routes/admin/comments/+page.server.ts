import { fail, redirect } from '@sveltejs/kit';
import { isContentAdminAction } from '$lib/server/admin-policy';
import { getAdminDb, requireAdmin } from '$lib/server/admin/access';
import { createAdminRepository, reasonText } from '$lib/server/admin/repository';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = getAdminDb(platform);
	await requireAdmin(locals, db);
	return { comments: await createAdminRepository(db).listComments() };
};

export const actions: Actions = {
	moderateComment: async ({ locals, platform, request }) => {
		const db = getAdminDb(platform);
		const { userId } = await requireAdmin(locals, db);
		const form = await request.formData();
		const action = String(form.get('action') ?? '');
		const commentId = String(form.get('commentId') ?? '');
		if (!commentId || !isContentAdminAction(action)) {
			return fail(400, { message: '잘못된 댓글 관리 요청입니다.' });
		}

		const ok = await createAdminRepository(db).moderateComment({
			commentId,
			actorUserId: userId,
			action,
			reason: reasonText(form.get('reason'))
		});
		if (!ok) return fail(404, { message: '댓글을 찾을 수 없습니다.' });
		redirect(303, '/admin/comments');
	}
};
