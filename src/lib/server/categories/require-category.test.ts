import { describe, expect, it } from 'vitest';
import { requireCategory } from './require-category';

const lil = {
	id: 'cat_lil',
	slug: 'lil',
	name: '릴토끼',
	group: '릴토끼',
	groupOrder: 2,
	sortOrder: 1
};

describe('카테고리 라우트 보호', () => {
	it('활성 카테고리를 반환한다', async () => {
		await expect(requireCategory('lil', async () => lil)).resolves.toEqual(lil);
	});

	it('존재하지 않는 주소에는 404를 던진다', async () => {
		await expect(requireCategory('missing', async () => undefined)).rejects.toMatchObject({
			status: 404
		});
	});
});
