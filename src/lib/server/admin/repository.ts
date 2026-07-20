import { desc, eq } from 'drizzle-orm';
import { actionToStatus, type AdminAction, type AdminTargetType } from '$lib/server/admin-policy';
import type { getDb } from '$lib/server/db';
import { adminAuditLogs, categories, comments, posts } from '$lib/server/db/schema';

type Db = ReturnType<typeof getDb>;

export function reasonText(value: FormDataEntryValue | null) {
	return String(value ?? '')
		.trim()
		.slice(0, 500);
}

export function createAdminRepository(db: Db) {
	async function logAction({
		actorUserId,
		action,
		targetType,
		targetId,
		reason
	}: {
		actorUserId: string;
		action: AdminAction;
		targetType: AdminTargetType;
		targetId: string;
		reason: string;
	}) {
		await db.insert(adminAuditLogs).values({
			id: crypto.randomUUID(),
			actorUserId,
			action,
			targetType,
			targetId,
			reason,
			createdAt: new Date()
		});
	}

	return {
		listPosts: () =>
			db
				.select({
					id: posts.id,
					title: posts.title,
					authorName: posts.authorName,
					status: posts.status,
					categoryName: categories.name,
					createdAt: posts.createdAt
				})
				.from(posts)
				.leftJoin(categories, eq(categories.id, posts.categoryId))
				.orderBy(desc(posts.createdAt))
				.limit(50),

		listComments: () =>
			db
				.select({
					id: comments.id,
					postId: comments.postId,
					postTitle: posts.title,
					authorName: comments.authorName,
					body: comments.body,
					status: comments.status,
					createdAt: comments.createdAt
				})
				.from(comments)
				.leftJoin(posts, eq(posts.id, comments.postId))
				.orderBy(desc(comments.createdAt))
				.limit(50),

		listAuditLogs: () =>
			db
				.select({
					id: adminAuditLogs.id,
					action: adminAuditLogs.action,
					targetType: adminAuditLogs.targetType,
					targetId: adminAuditLogs.targetId,
					reason: adminAuditLogs.reason,
					createdAt: adminAuditLogs.createdAt
				})
				.from(adminAuditLogs)
				.orderBy(desc(adminAuditLogs.createdAt))
				.limit(30),

		moderatePost: async ({
			postId,
			actorUserId,
			action,
			reason
		}: {
			postId: string;
			actorUserId: string;
			action: AdminAction;
			reason: string;
		}) => {
			const updated = await db
				.update(posts)
				.set({ status: actionToStatus(action), updatedAt: new Date() })
				.where(eq(posts.id, postId))
				.returning({ id: posts.id });
			if (updated.length === 0) return false;
			await logAction({ actorUserId, action, targetType: 'post', targetId: postId, reason });
			return true;
		},

		moderateComment: async ({
			commentId,
			actorUserId,
			action,
			reason
		}: {
			commentId: string;
			actorUserId: string;
			action: AdminAction;
			reason: string;
		}) => {
			const updated = await db
				.update(comments)
				.set({ status: actionToStatus(action), updatedAt: new Date() })
				.where(eq(comments.id, commentId))
				.returning({ id: comments.id });
			if (updated.length === 0) return false;
			await logAction({ actorUserId, action, targetType: 'comment', targetId: commentId, reason });
			return true;
		}
	};
}
