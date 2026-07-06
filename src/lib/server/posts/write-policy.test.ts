import { describe, expect, it } from 'vitest';
import { canWriteToCategory, validatePostInput } from './write-policy';

describe('글 작성 정책', () => {
	it('standard 게시판만 직접 작성할 수 있다', () => {
		expect(canWriteToCategory({ movementKind: 'standard' })).toBe(true);
		expect(canWriteToCategory({ movementKind: 'promotion_source' })).toBe(false);
		expect(canWriteToCategory({ movementKind: 'promotion_target' })).toBe(false);
		expect(canWriteToCategory({ movementKind: 'worst_target' })).toBe(false);
	});

	it('제목과 본문을 검증하고 정리한다', () => {
		expect(validatePostInput({ title: '  제목  ', body: '<p>본문</p>' })).toEqual({
			ok: true,
			title: '제목',
			body: '<p>본문</p>'
		});
	});

	it('빈 제목과 빈 본문은 거절한다', () => {
		expect(validatePostInput({ title: '', body: '<p></p>' })).toEqual({
			ok: false,
			message: '제목을 입력해 주세요.'
		});
		expect(validatePostInput({ title: '제목', body: '<p><br></p>' })).toEqual({
			ok: false,
			message: '본문을 입력해 주세요.'
		});
	});
});
