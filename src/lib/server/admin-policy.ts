export type AdminRole = 'admin' | 'manager' | 'user';
export type AdminAction = 'hide' | 'restore' | 'delete';
export type AdminTargetType = 'post' | 'comment';

const adminActions: AdminAction[] = ['hide', 'restore', 'delete'];

export function canAccessAdmin(role: AdminRole | null | undefined) {
	return role === 'admin' || role === 'manager';
}

export function canManageMembers(role: AdminRole | null | undefined) {
	return role === 'admin';
}

export function isAdminAction(value: unknown): value is AdminAction {
	return typeof value === 'string' && adminActions.includes(value as AdminAction);
}

export function actionToStatus(action: AdminAction) {
	if (action === 'hide') return 'hidden';
	if (action === 'restore') return 'public';
	return 'deleted';
}
