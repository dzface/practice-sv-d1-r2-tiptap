import { describe, expect, it } from 'vitest';
import { canWriteToCategory, sanitizePostBody, validatePostInput } from './write-policy';

describe('글 작성 정책', () => {
	it('빅토끼, 빅토끼 인기글, 릴토끼 워스트만 직접 작성을 막는다', () => {
		expect(canWriteToCategory({ slug: 'lil' })).toBe(true);
		expect(canWriteToCategory({ slug: 'hotdeal' })).toBe(true);
		expect(canWriteToCategory({ slug: 'big' })).toBe(false);
		expect(canWriteToCategory({ slug: 'trend' })).toBe(false);
		expect(canWriteToCategory({ slug: 'worst' })).toBe(false);
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

	it('본문 HTML에서 위험한 태그와 속성을 제거한다', () => {
		expect(
			sanitizePostBody(
				'<p onclick="alert(1)">본문<script>alert(1)</script></p><a href="javascript:alert(1)">나쁜 링크</a><strong>굵게</strong>'
			)
		).toBe('<p>본문</p><a>나쁜 링크</a><strong>굵게</strong>');
	});
});
