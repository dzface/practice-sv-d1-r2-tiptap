import { describe, expect, it } from 'vitest';
import { validateNickname } from './nickname';

describe('닉네임 검증', () => {
	it('앞뒤 공백을 제거하고 2~16자 닉네임을 허용한다', () => {
		expect(validateNickname('  릴토끼_01  ')).toEqual({ ok: true, nickname: '릴토끼_01' });
	});

	it('너무 짧거나 허용되지 않은 문자가 있으면 거절한다', () => {
		expect(validateNickname('a')).toEqual({
			ok: false,
			message: '닉네임은 2~16자로 입력해 주세요.'
		});
		expect(validateNickname('릴 토끼')).toEqual({
			ok: false,
			message: '닉네임은 한글, 영문, 숫자, 밑줄만 사용할 수 있습니다.'
		});
	});
});
