import { describe, expect, it } from 'vitest';
import { shouldRedirectToProfileSetup } from './profile-guard';

describe('프로필 설정 보호', () => {
	it('로그인했고 프로필이 없으면 일반 페이지에서 가입 마무리로 보낸다', () => {
		expect(
			shouldRedirectToProfileSetup({ isLoggedIn: true, hasProfile: false, pathname: '/' })
		).toBe(true);
	});

	it('비로그인, 프로필 보유, 가입 페이지, 설정 페이지는 리다이렉트하지 않는다', () => {
		expect(
			shouldRedirectToProfileSetup({ isLoggedIn: false, hasProfile: false, pathname: '/' })
		).toBe(false);
		expect(
			shouldRedirectToProfileSetup({ isLoggedIn: true, hasProfile: true, pathname: '/' })
		).toBe(false);
		expect(
			shouldRedirectToProfileSetup({
				isLoggedIn: true,
				hasProfile: false,
				pathname: '/signup'
			})
		).toBe(false);
		expect(
			shouldRedirectToProfileSetup({
				isLoggedIn: true,
				hasProfile: false,
				pathname: '/profile/setup'
			})
		).toBe(false);
	});
});
