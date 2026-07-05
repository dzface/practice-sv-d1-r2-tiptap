import { describe, expect, it } from 'vitest';
import { groupCategories, type CategorySummary } from './category';

const categories: CategorySummary[] = [
	{
		id: 'cat_science',
		slug: 'science',
		name: '과학',
		group: '읽을거리',
		groupOrder: 4,
		sortOrder: 2
	},
	{
		id: 'cat_lil',
		slug: 'lil',
		name: '릴토끼',
		group: '릴토끼',
		groupOrder: 2,
		sortOrder: 1
	},
	{
		id: 'cat_humor',
		slug: 'humor',
		name: '유머',
		group: '읽을거리',
		groupOrder: 4,
		sortOrder: 1
	}
];

describe('카테고리 그룹', () => {
	it('그룹과 그룹 안의 카테고리를 설정 순서대로 정렬한다', () => {
		expect(groupCategories(categories)).toEqual([
			{ name: '릴토끼', categories: [categories[1]] },
			{ name: '읽을거리', categories: [categories[2], categories[0]] }
		]);
	});
});
