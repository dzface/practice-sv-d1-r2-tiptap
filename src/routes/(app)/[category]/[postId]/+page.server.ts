import { error, fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { createCategoryRepository } from '$lib/server/categories/repository';
import { requireCategory } from '$lib/server/categories/require-category';
import { validateCommentInput } from '$lib/server/comments/comment-policy';
import { createCommentRepository } from '$lib/server/comments/repository';
import { canManageContent, type StoredVoteValue } from '$lib/server/content-actions';
import { resolvePostAttachments } from '$lib/server/media-policy';
import { createPostRepository } from '$lib/server/posts/repository';
import { validatePostInput } from '$lib/server/posts/write-policy';
import { createProfileRepository } from '$lib/server/profiles/repository';
import type { Actions, PageServerLoad } from './$types';

const notFound = '게시글을 찾을 수 없습니다.';

function getDbOrThrow(platform: App.Platform | undefined) {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
	return getDb(platform.env.DB);
}

async function getCategory(db: ReturnType<typeof getDb>, slug: string) {
	return requireCategory(slug, createCategoryRepository(db).findActiveBySlug);
}

function getVote(value: FormDataEntryValue | null): StoredVoteValue {
	if (value === 'none') return null;
	return value === 'down' ? -1 : 1;
}

async function requireProfile(locals: App.Locals, db: ReturnType<typeof getDb>) {
	if (!locals.user) redirect(303, '/login');
	const profile = await createProfileRepository(db).findByUserId(locals.user.id);
	if (!profile) redirect(303, '/profile/setup');
	return profile;
}

export const load: PageServerLoad = async ({ locals, params, platform, url }) => {
	const db = getDbOrThrow(platform);
	const category = await getCategory(db, params.category);
	const postRepository = createPostRepository(db);
	const commentRepository = createCommentRepository(db);
	const post = await postRepository.findPublicById(category.id, params.postId);
	if (!post) error(404, notFound);
	const attachments = await postRepository.listAttachments(post.id);
	const comments = await commentRepository.listPublicByPost(post.id);
	const postVote = locals.user
		? await postRepository.getUserVote({ postId: post.id, userId: locals.user.id })
		: null;

	return {
		category,
		attachments,
		editPost: url.searchParams.get('editPost') === '1',
		editCommentId: url.searchParams.get('editComment'),
		post: { ...post, canManage: canManageContent(locals.user?.id, post.authorId), vote: postVote },
		comments: await Promise.all(
			comments.map(async (comment) => ({
				...comment,
				canManage: canManageContent(locals.user?.id, comment.authorId),
				vote: locals.user
					? await commentRepository.getUserVote({ commentId: comment.id, userId: locals.user.id })
					: null
			}))
		)
	};
};

export const actions: Actions = {
	createComment: async ({ locals, params, platform, request }) => {
		const db = getDbOrThrow(platform);
		const profile = await requireProfile(locals, db);
		const category = await getCategory(db, params.category);
		if (!(await createPostRepository(db).isPublicInCategory(category.id, params.postId))) {
			error(404, notFound);
		}

		const form = await request.formData();
		const input = validateCommentInput(form.get('body'));
		if (!input.ok)
			return fail(400, {
				form: 'createComment',
				message: input.message,
				body: String(form.get('body') ?? '')
			});

		const commentRepository = createCommentRepository(db);
		const parentCommentId = String(form.get('parentCommentId') ?? '');
		const parentComment = parentCommentId
			? await commentRepository.findPublicInPost({
					commentId: parentCommentId,
					postId: params.postId
				})
			: null;
		if (parentCommentId && !parentComment) {
			return fail(400, {
				form: 'createComment',
				message: '답글을 달 댓글을 찾을 수 없습니다.',
				body: input.body,
				parentCommentId
			});
		}

		await commentRepository.create({
			postId: params.postId,
			authorId: locals.user!.id,
			authorName: profile.nickname,
			parentCommentId: parentComment?.id ?? null,
			body: input.body
		});

		redirect(303, `/${params.category}/${params.postId}`);
	},

	updatePost: async ({ locals, params, platform, request }) => {
		const db = getDbOrThrow(platform);
		if (!platform?.env.FILES) throw new Error('R2 binding "FILES" not found');
		await requireProfile(locals, db);
		const form = await request.formData();
		const uploaded = await resolvePostAttachments({
			body: String(form.get('body') ?? ''),
			bucket: platform.env.FILES,
			form,
			userId: locals.user!.id
		});
		const input = validatePostInput({ title: form.get('title'), body: uploaded.body });
		if (!input.ok) return fail(400, { form: 'updatePost', message: input.message });

		const updated = await createPostRepository(db).updateOwned({
			postId: params.postId,
			authorId: locals.user!.id,
			title: input.title,
			body: input.body,
			attachments: uploaded.attachments
		});
		if (!updated) return fail(403, { form: 'updatePost', message: '수정 권한이 없습니다.' });
		redirect(303, `/${params.category}/${params.postId}`);
	},

	deletePost: async ({ locals, params, platform }) => {
		const db = getDbOrThrow(platform);
		await requireProfile(locals, db);
		const deleted = await createPostRepository(db).deleteOwned({
			postId: params.postId,
			authorId: locals.user!.id
		});
		if (!deleted) return fail(403, { form: 'deletePost', message: '삭제 권한이 없습니다.' });
		redirect(303, `/${params.category}`);
	},

	votePost: async ({ locals, params, platform, request }) => {
		const db = getDbOrThrow(platform);
		await requireProfile(locals, db);
		const form = await request.formData();
		await createPostRepository(db).vote({
			postId: params.postId,
			userId: locals.user!.id,
			value: getVote(form.get('value'))
		});
		redirect(303, `/${params.category}/${params.postId}`);
	},

	updateComment: async ({ locals, params, platform, request }) => {
		const db = getDbOrThrow(platform);
		await requireProfile(locals, db);
		const form = await request.formData();
		const input = validateCommentInput(form.get('body'));
		if (!input.ok) return fail(400, { form: 'updateComment', message: input.message });

		const updated = await createCommentRepository(db).updateOwned({
			commentId: String(form.get('commentId') ?? ''),
			authorId: locals.user!.id,
			body: input.body
		});
		if (!updated) return fail(403, { form: 'updateComment', message: '수정 권한이 없습니다.' });
		redirect(303, `/${params.category}/${params.postId}`);
	},

	deleteComment: async ({ locals, params, platform, request }) => {
		const db = getDbOrThrow(platform);
		await requireProfile(locals, db);
		const form = await request.formData();
		const deleted = await createCommentRepository(db).deleteOwned({
			commentId: String(form.get('commentId') ?? ''),
			authorId: locals.user!.id
		});
		if (!deleted) return fail(403, { form: 'deleteComment', message: '삭제 권한이 없습니다.' });
		redirect(303, `/${params.category}/${params.postId}`);
	},

	voteComment: async ({ locals, params, platform, request }) => {
		const db = getDbOrThrow(platform);
		await requireProfile(locals, db);
		const form = await request.formData();
		await createCommentRepository(db).vote({
			commentId: String(form.get('commentId') ?? ''),
			userId: locals.user!.id,
			value: getVote(form.get('value'))
		});
		redirect(303, `/${params.category}/${params.postId}`);
	}
};
