import { describe, expect, test } from 'vitest';
import { canAccessAdmin, canManageMembers, isAdminAction, type AdminRole } from './admin-policy';

describe('admin policy', () => {
	test('allows admin and manager to access admin pages', () => {
		expect(canAccessAdmin('admin')).toBe(true);
		expect(canAccessAdmin('manager')).toBe(true);
		expect(canAccessAdmin('user')).toBe(false);
		expect(canAccessAdmin(null)).toBe(false);
	});

	test('allows only admin to manage members', () => {
		expect(canManageMembers('admin')).toBe(true);
		expect(canManageMembers('manager')).toBe(false);
		expect(canManageMembers('user')).toBe(false);
	});

	test('accepts only known audit actions', () => {
		expect(isAdminAction('hide')).toBe(true);
		expect(isAdminAction('restore')).toBe(true);
		expect(isAdminAction('delete')).toBe(true);
		expect(isAdminAction('promote' as AdminRole)).toBe(false);
	});
});
