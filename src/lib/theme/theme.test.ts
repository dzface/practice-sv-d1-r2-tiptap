import { describe, expect, it } from 'vitest';
import { parseStoredTheme } from './theme';

describe('테마 저장값', () => {
	it('지원하는 밝은 모드와 어두운 모드를 반환한다', () => {
		expect(parseStoredTheme('light')).toBe('light');
		expect(parseStoredTheme('dark')).toBe('dark');
	});

	it('없는 값과 알 수 없는 값을 무시한다', () => {
		expect(parseStoredTheme(null)).toBeUndefined();
		expect(parseStoredTheme('sepia')).toBeUndefined();
	});
});
