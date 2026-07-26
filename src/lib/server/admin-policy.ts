export type AdminRole = 'admin' | 'manager' | 'user';
export type AdminAction = 'hide' | 'restore' | 'delete' | 'role_change' | 'user_update';
export type ContentAdminAction = Exclude<AdminAction, 'role_change' | 'user_update'>;
export type AdminTargetType = 'post' | 'comment' | 'user';

const adminActions: AdminAction[] = ['hide', 'restore', 'delete', 'role_change', 'user_update'];
const contentAdminActions: ContentAdminAction[] = ['hide', 'restore', 'delete'];

export function canAccessAdmin(role: AdminRole | null | undefined) {
	return role === 'admin' || role === 'manager';
}

export function canManageUsers(role: AdminRole | null | undefined) {
	return role === 'admin';
}

export function isAdminAction(value: unknown): value is AdminAction {
	return typeof value === 'string' && adminActions.includes(value as AdminAction);
}

export function isContentAdminAction(value: unknown): value is ContentAdminAction {
	return typeof value === 'string' && contentAdminActions.includes(value as ContentAdminAction);
}

export function actionToStatus(action: ContentAdminAction) {
	if (action === 'hide') return 'hidden';
	if (action === 'restore') return 'public';
	return 'deleted';
}
