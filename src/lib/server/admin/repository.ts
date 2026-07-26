import { and, desc, eq, like, or } from 'drizzle-orm';
import {
	actionToStatus,
	type AdminAction,
	type AdminRole,
	type AdminTargetType
} from '$lib/server/admin-policy';
import type { getDb } from '$lib/server/db';
import { adminAuditLogs, categories, comments, posts, profiles, user } from '$lib/server/db/schema';

type Db = ReturnType<typeof getDb>;

type UserSearch = {
	field?: string;
	keyword?: string;
};

type UserStatus = 'active' | 'suspended';

export function reasonText(value: FormDataEntryValue | null) {
	return String(value ?? '')
		.trim()
		.slice(0, 500);
}

function userSearchWhere({ field, keyword }: UserSearch) {
	const term = String(keyword ?? '').trim();
	if (!term) return undefined;
	const value = `%${term}%`;

	if (field === 'id') return like(profiles.userId, value);
	if (field === 'email') return like(user.email, value);
	if (field === 'name') return like(user.name, value);
	if (field === 'nickname') return like(profiles.nickname, value);
	if (field === 'adminMemo') return like(profiles.adminMemo, value);

	return or(
		like(profiles.userId, value),
		like(user.email, value),
		like(user.name, value),
		like(profiles.nickname, value),
		like(profiles.adminMemo, value)
	);
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

	const userColumns = {
		userId: profiles.userId,
		email: user.email,
		name: user.name,
		nickname: profiles.nickname,
		role: profiles.role,
		status: profiles.status,
		points: profiles.points,
		adminMemo: profiles.adminMemo,
		suspendedUntil: profiles.suspendedUntil,
		createdAt: profiles.createdAt,
		updatedAt: profiles.updatedAt
	};

	return {
		listUsers: ({ field, keyword }: UserSearch = {}) => {
			let query = db
				.select(userColumns)
				.from(profiles)
				.leftJoin(user, eq(user.id, profiles.userId))
				.$dynamic();
			const where = userSearchWhere({ field, keyword });
			if (where) query = query.where(where);
			return query.orderBy(desc(profiles.createdAt)).limit(50);
		},

		findUser: async (userId: string) => {
			const [row] = await db
				.select(userColumns)
				.from(profiles)
				.leftJoin(user, eq(user.id, profiles.userId))
				.where(eq(profiles.userId, userId))
				.limit(1);
			return row ?? null;
		},

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
			action: Exclude<AdminAction, 'role_change' | 'user_update'>;
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
			action: Exclude<AdminAction, 'role_change' | 'user_update'>;
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
		},

		updateUserRole: async ({
			userId,
			actorUserId,
			role,
			reason
		}: {
			userId: string;
			actorUserId: string;
			role: AdminRole;
			reason: string;
		}) => {
			const updated = await db
				.update(profiles)
				.set({ role, updatedAt: new Date() })
				.where(eq(profiles.userId, userId))
				.returning({ userId: profiles.userId });
			if (updated.length === 0) return false;
			await logAction({
				actorUserId,
				action: 'role_change',
				targetType: 'user',
				targetId: userId,
				reason
			});
			return true;
		},

		updateUserStatus: async ({
			userId,
			actorUserId,
			status
		}: {
			userId: string;
			actorUserId: string;
			status: UserStatus;
		}) => {
			const nextProfile =
				status === 'active'
					? { status, suspendedUntil: null, updatedAt: new Date() }
					: { status, updatedAt: new Date() };
			const [profile] = await db
				.update(profiles)
				.set(nextProfile)
				.where(eq(profiles.userId, userId))
				.returning({ userId: profiles.userId });
			if (!profile) return false;
			await logAction({
				actorUserId,
				action: 'user_update',
				targetType: 'user',
				targetId: userId,
				reason: `status:${status}`
			});
			return true;
		},

		updateUserProfile: async ({
			userId,
			actorUserId,
			email,
			name,
			nickname,
			status,
			suspendedUntil,
			adminMemo
		}: {
			userId: string;
			actorUserId: string;
			email: string;
			name: string;
			nickname: string;
			status: UserStatus;
			suspendedUntil: Date | null;
			adminMemo: string;
		}) => {
			const [profile] = await db
				.update(profiles)
				.set({ nickname, status, suspendedUntil, adminMemo, updatedAt: new Date() })
				.where(eq(profiles.userId, userId))
				.returning({ userId: profiles.userId });
			if (!profile) return false;

			await db.update(user).set({ email, name, updatedAt: new Date() }).where(eq(user.id, userId));
			await logAction({
				actorUserId,
				action: 'user_update',
				targetType: 'user',
				targetId: userId,
				reason: 'profile'
			});
			return true;
		}
	};
}
