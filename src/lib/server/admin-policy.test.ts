import { describe, expect, test } from 'vitest';
import { canAccessAdmin, canManageUsers, isAdminAction, type AdminRole } from './admin-policy';

describe('admin policy', () => {
	test('allows admin and manager to access admin pages', () => {
		expect(canAccessAdmin('admin')).toBe(true);
		expect(canAccessAdmin('manager')).toBe(true);
		expect(canAccessAdmin('user')).toBe(false);
		expect(canAccessAdmin(null)).toBe(false);
	});

	test('allows only admin to manage users', () => {
		expect(canManageUsers('admin')).toBe(true);
		expect(canManageUsers('manager')).toBe(false);
		expect(canManageUsers('user')).toBe(false);
	});

	test('accepts only known audit actions', () => {
		expect(isAdminAction('hide')).toBe(true);
		expect(isAdminAction('restore')).toBe(true);
		expect(isAdminAction('delete')).toBe(true);
		expect(isAdminAction('promote' as AdminRole)).toBe(false);
	});
});
