import { describe, expect, test, vi } from 'vitest';
import {
	ANONYMOUS_CATEGORY_SLUGS,
	createAnonymousName,
	isAnonymousCategory,
	pickAnonymousName
} from './anonymous';

describe('anonymous author policy', () => {
	test('marks anonymous and consultation categories as anonymous', () => {
		expect(ANONYMOUS_CATEGORY_SLUGS).toEqual(['anonym', 'consultation']);
		expect(isAnonymousCategory('anonym')).toBe(true);
		expect(isAnonymousCategory('consultation')).toBe(true);
		expect(isAnonymousCategory('stock')).toBe(false);
	});

	test('creates a 7 character uppercase alpha numeric name', () => {
		vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
			const values = array as Uint8Array;
			for (let index = 0; index < values.length; index += 1) values[index] = index;
			return array;
		});

		expect(createAnonymousName()).toBe('ABCDEFG');
	});

	test('reuses the same user anonymous name inside one post', () => {
		expect(
			pickAnonymousName({
				postAuthorId: 'user-1',
				postAnonymousName: 'POST001',
				commentAuthors: [{ authorId: 'user-2', anonymousName: 'CMNT002' }],
				userId: 'user-2',
				generate: () => 'NEW0001'
			})
		).toBe('CMNT002');
	});

	test('uses the post anonymous name when the post author comments', () => {
		expect(
			pickAnonymousName({
				postAuthorId: 'user-1',
				postAnonymousName: 'POST001',
				commentAuthors: [],
				userId: 'user-1',
				generate: () => 'NEW0001'
			})
		).toBe('POST001');
	});

	test('generates a non-duplicated anonymous name for a new commenter', () => {
		const generated = ['POST001', 'CMNT002', 'NEW0001'];
		expect(
			pickAnonymousName({
				postAuthorId: 'user-1',
				postAnonymousName: 'POST001',
				commentAuthors: [{ authorId: 'user-2', anonymousName: 'CMNT002' }],
				userId: 'user-3',
				generate: () => generated.shift() ?? 'FALLBK1'
			})
		).toBe('NEW0001');
	});
});
