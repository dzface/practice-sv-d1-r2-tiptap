<script lang="ts">
	import { onMount } from 'svelte';
	import { THEME_STORAGE_KEY, type Theme } from '$lib/theme/theme';

	let theme = $state<Theme>('light');

	onMount(() => {
		theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
	});

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem(THEME_STORAGE_KEY, theme);
		} catch {
			// 저장소가 차단돼도 현재 페이지에는 선택한 테마를 유지한다.
		}
	}
</script>

<button type="button" onclick={toggle} aria-label="색상 모드 변경" title="색상 모드 변경">
	<span class="theme-text">{theme === 'dark' ? '밝게' : '어둡게'}</span>
	<span class="material-symbols-outlined theme-icon" aria-hidden="true"
		>{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span
	>
</button>

<style>
	button {
		min-width: 64px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	.theme-icon {
		display: none;
	}

	@media (max-width: 1110px) {
		button {
			min-width: 2rem;
			border: 0;
			background: transparent;
			color: inherit;
		}

		.theme-text {
			display: none;
		}

		.theme-icon {
			display: inline-block;
		}
	}
</style>
