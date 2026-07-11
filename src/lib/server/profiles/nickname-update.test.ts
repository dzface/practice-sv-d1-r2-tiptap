import { describe, expect, it } from 'vitest';
import { canUseNickname } from './nickname-update';

describe('닉네임 수정 가능 여부', () => {
	it('현재 닉네임과 같으면 사용 가능하다', () => {
		expect(canUseNickname({ currentNickname: '릴토끼', nextNickname: '릴토끼', taken: true })).toBe(
			true
		);
	});

	it('다른 사람이 쓰는 닉네임이면 사용할 수 없다', () => {
		expect(canUseNickname({ currentNickname: '릴토끼', nextNickname: '빅토끼', taken: true })).toBe(
			false
		);
	});

	it('중복이 아니면 사용할 수 있다', () => {
		expect(canUseNickname({ currentNickname: '릴토끼', nextNickname: '빅토끼', taken: false })).toBe(
			true
		);
	});
});
