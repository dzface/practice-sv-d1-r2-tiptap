import { describe, expect, test } from 'vitest';
import {
	defaultPointSettings,
	parsePointSettingsForm,
	pointEventDefaults
} from '$lib/server/points/settings';

describe('point settings', () => {
	test('keeps design defaults for point name, level, and movement rewards', () => {
		expect(defaultPointSettings.pointName).toBe('포인트');
		expect(defaultPointSettings.maxLevel).toBe(5);
		expect(defaultPointSettings.eventValues.lil_to_big).toBe(100);
		expect(defaultPointSettings.eventValues.lil_to_worst).toBe(-30);
		expect(defaultPointSettings.eventValues.big_to_trend).toBe(1000);
	});

	test('parses admin point setting form values', () => {
		const form = new FormData();
		form.set('pointName', '토끼력');
		form.set('maxLevel', '7');
		form.set('blockDownloadForUsers', 'on');
		for (const event of pointEventDefaults) form.set(event.key, String(event.value + 1));

		const settings = parsePointSettingsForm(form);
		expect(settings.pointName).toBe('토끼력');
		expect(settings.maxLevel).toBe(7);
		expect(settings.blockDownloadForUsers).toBe(true);
		expect(settings.blockReadForUsers).toBe(false);
		expect(settings.eventValues.lil_to_big).toBe(101);
	});
});
