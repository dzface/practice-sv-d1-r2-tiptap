import { describe, expect, it } from 'vitest';
import { initialMovementRules } from './movement-rules';

describe('initialMovementRules', () => {
	it('릴토끼와 빅토끼의 단계별 이동 기준과 포인트를 정의한다', () => {
		expect(initialMovementRules).toEqual([
			{
				id: 'lil_to_big',
				sourceCategoryId: 'cat_lil',
				targetCategoryId: 'cat_big',
				direction: 'gte',
				scoreThreshold: 10,
				pointDelta: 100
			},
			{
				id: 'lil_to_worst',
				sourceCategoryId: 'cat_lil',
				targetCategoryId: 'cat_worst',
				direction: 'lte',
				scoreThreshold: -10,
				pointDelta: -30
			},
			{
				id: 'big_to_trend',
				sourceCategoryId: 'cat_big',
				targetCategoryId: 'trend',
				direction: 'gte',
				scoreThreshold: 100,
				pointDelta: 1000
			}
		]);
	});
});
