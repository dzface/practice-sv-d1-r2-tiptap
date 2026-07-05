export const THEME_STORAGE_KEY = 'liltokki-theme';
export type Theme = 'light' | 'dark';

export function parseStoredTheme(value: string | null): Theme | undefined {
	return value === 'light' || value === 'dark' ? value : undefined;
}
