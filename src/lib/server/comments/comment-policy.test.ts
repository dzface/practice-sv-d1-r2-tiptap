import { describe, expect, it } from 'vitest';
import { validateCommentInput } from './comment-policy';

describe('validateCommentInput', () => {
	it('accepts trimmed comment text', () => {
		expect(validateCommentInput('  hello  ')).toEqual({ ok: true, body: 'hello' });
	});

	it('rejects blank comments', () => {
		expect(validateCommentInput('   ')).toEqual({
			ok: false,
			message: '댓글을 입력해 주세요.'
		});
	});

	it('rejects comments over 1000 characters', () => {
		expect(validateCommentInput('a'.repeat(1001))).toEqual({
			ok: false,
			message: '댓글은 1000자 이하로 입력해 주세요.'
		});
	});
});
