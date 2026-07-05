import { describe, expect, it } from 'vitest';
import { siteConfig } from './site.config';

describe('사이트 설정', () => {
	it('배포에 필요한 브랜드 값을 제공한다', () => {
		expect(siteConfig.siteName).toBe('릴토끼');
		expect(siteConfig.companyName.length).toBeGreaterThan(0);
		expect(siteConfig.reportEmail).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
		expect(siteConfig.termsEffectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
