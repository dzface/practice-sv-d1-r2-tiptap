import { describe, expect, it } from 'vitest';
import { createPagination } from './pagination';

describe('페이지네이션', () => {
	it('현재 페이지 주변 5개 페이지와 이전/다음 여부를 만든다', () => {
		expect(createPagination({ page: 7, totalItems: 200, pageSize: 20 })).toEqual({
			page: 7,
			pageSize: 20,
			totalItems: 200,
			totalPages: 10,
			pages: [6, 7, 8, 9, 10],
			previousPage: 6,
			nextPage: 8
		});
	});

	it('페이지 범위를 1과 마지막 페이지로 제한한다', () => {
		expect(createPagination({ page: -1, totalItems: 0, pageSize: 20 })).toEqual({
			page: 1,
			pageSize: 20,
			totalItems: 0,
			totalPages: 1,
			pages: [1],
			previousPage: null,
			nextPage: null
		});
	});
});
