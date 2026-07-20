import { error, fail, redirect } from '@sveltejs/kit';
import { canAccessAdmin, isAdminAction } from '$lib/server/admin-policy';
import { createAdminRepository, reasonText } from '$lib/server/admin/repository';
import { getDb } from '$lib/server/db';
import { createProfileRepository } from '$lib/server/profiles/repository';
import type { Actions, PageServerLoad } from './$types';

async function requireAdmin(locals: App.Locals, db: ReturnType<typeof getDb>) {
	if (!locals.user) redirect(303, '/login');
	const profile = await createProfileRepository(db).findByUserId(locals.user.id);
	if (!canAccessAdmin(profile?.role)) error(403, '관리 권한이 없습니다.');
	return { userId: locals.user.id, profile };
}

function getDbOrThrow(platform: App.Platform | undefined) {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
	return getDb(platform.env.DB);
}

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = getDbOrThrow(platform);
	await requireAdmin(locals, db);
	const admin = createAdminRepository(db);

	return {
		posts: await admin.listPosts(),
		comments: await admin.listComments(),
		auditLogs: await admin.listAuditLogs()
	};
};

export const actions: Actions = {
	moderatePost: async ({ locals, platform, request }) => {
		const db = getDbOrThrow(platform);
		const { userId } = await requireAdmin(locals, db);
		const form = await request.formData();
		const action = String(form.get('action') ?? '');
		const postId = String(form.get('postId') ?? '');
		if (!postId || !isAdminAction(action)) {
			return fail(400, { message: '잘못된 게시글 관리 요청입니다.' });
		}

		const ok = await createAdminRepository(db).moderatePost({
			postId,
			actorUserId: userId,
			action,
			reason: reasonText(form.get('reason'))
		});
		if (!ok) return fail(404, { message: '게시글을 찾을 수 없습니다.' });
		redirect(303, '/admin');
	},

	moderateComment: async ({ locals, platform, request }) => {
		const db = getDbOrThrow(platform);
		const { userId } = await requireAdmin(locals, db);
		const form = await request.formData();
		const action = String(form.get('action') ?? '');
		const commentId = String(form.get('commentId') ?? '');
		if (!commentId || !isAdminAction(action)) {
			return fail(400, { message: '잘못된 댓글 관리 요청입니다.' });
		}

		const ok = await createAdminRepository(db).moderateComment({
			commentId,
			actorUserId: userId,
			action,
			reason: reasonText(form.get('reason'))
		});
		if (!ok) return fail(404, { message: '댓글을 찾을 수 없습니다.' });
		redirect(303, '/admin');
	}
};
