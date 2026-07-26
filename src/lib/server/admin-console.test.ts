import { describe, expect, test } from 'vitest';
import { adminMenuGroups, findAdminMenuItem } from './admin-console';

describe('admin console menu', () => {
	test('groups user, content, and operation menus for the left console', () => {
		expect(adminMenuGroups.map((group) => group.label)).toEqual(['회원', '콘텐츠', '운영']);
		expect(adminMenuGroups[0].items.map((item) => item.label)).toEqual(['회원목록', '포인트']);
		expect(adminMenuGroups[0].items.map((item) => item.href)).toEqual([
			'/admin/users',
			'/admin/points'
		]);
		expect(adminMenuGroups[1].items.map((item) => item.label)).toEqual([
			'게시판',
			'페이지',
			'댓글',
			'파일',
			'설문'
		]);
		expect(adminMenuGroups[2].items.map((item) => item.label)).toEqual(['로그 이벤트']);
		expect(adminMenuGroups[2].items.map((item) => item.href)).toEqual(['/admin/logs']);
	});

	test('marks planned menus as disabled until implementation', () => {
		expect(findAdminMenuItem('survey')?.disabled).toBe(true);
		expect(findAdminMenuItem('comments')?.disabled).toBe(false);
		expect(findAdminMenuItem('logs')?.disabled).toBe(false);
	});
});
