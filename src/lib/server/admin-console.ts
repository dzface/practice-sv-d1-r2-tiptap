export type AdminMenuItem = {
	id: string;
	label: string;
	href: string;
	disabled?: boolean;
};

export type AdminMenuGroup = {
	label: string;
	items: AdminMenuItem[];
};

export const adminMenuGroups: AdminMenuGroup[] = [
	{
		label: '회원',
		items: [
			{ id: 'users', label: '회원목록', href: '/admin/users' },
			{ id: 'points', label: '포인트', href: '/admin/points' }
		]
	},
	{
		label: '콘텐츠',
		items: [
			{ id: 'boards', label: '게시판', href: '/admin/posts' },
			{ id: 'pages', label: '페이지', href: '/admin/pages' },
			{ id: 'comments', label: '댓글', href: '/admin/comments' },
			{ id: 'files', label: '파일', href: '/admin/files' },
			{ id: 'survey', label: '설문', href: '/admin/surveys', disabled: true }
		]
	},
	{
		label: '운영',
		items: [{ id: 'logs', label: '로그 이벤트', href: '/admin/logs' }]
	}
];

export function findAdminMenuItem(id: string) {
	const item = adminMenuGroups.flatMap((group) => group.items).find((entry) => entry.id === id);
	return item ? { ...item, disabled: item.disabled ?? false } : null;
}
