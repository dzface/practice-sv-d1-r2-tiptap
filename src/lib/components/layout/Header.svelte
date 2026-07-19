<script lang="ts">
	import { resolve } from '$app/paths';
	import type { CategoryGroup } from '$lib/categories/category';
	import Nav from '$lib/components/layout/Nav.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	type HeaderUser = {
		name: string;
		profile: { nickname: string } | null;
	};

	let { groups, user }: { groups: CategoryGroup[]; user: HeaderUser | null } = $props();
	let navOpen = $state(false);
</script>

<header>
	<div class="brand-row">
		<button
			type="button"
			class="menu-button"
			aria-label={navOpen ? '메뉴 닫기' : '메뉴 열기'}
			aria-expanded={navOpen}
			onclick={() => (navOpen = !navOpen)}
		>
			<span class="material-symbols-outlined" aria-hidden="true">menu</span>
		</button>
		<a class="logo" href={resolve('/')}><strong>Lil-tokki</strong></a>
	</div>

	<div class:open={navOpen} class="nav-panel">
		<Nav {groups} />
	</div>
	{#if navOpen}<button
			class="nav-backdrop"
			type="button"
			aria-label="메뉴 닫기"
			onclick={() => (navOpen = false)}
		></button>{/if}

	<div class="header-actions">
		<ThemeToggle />
		{#if user}
			{#if user.profile}
				<a
					class="profile-link"
					href={resolve('/(app)/profile')}
					aria-label="프로필"
					title={user.profile.nickname}
					><span class="profile-text">{user.profile.nickname}</span><span
						class="material-symbols-outlined profile-icon"
						aria-hidden="true">account_circle</span
					></a
				>
			{:else}
				<a class="profile-link" href={resolve('/(app)/profile/setup')}>닉네임 설정</a>
			{/if}
			<form method="post" action="/logout">
				<button type="submit" aria-label="로그아웃" title="로그아웃"
					><span class="logout-text">로그아웃</span><span
						class="material-symbols-outlined logout-icon"
						aria-hidden="true">logout</span
					></button
				>
			</form>
		{:else}
			<a class="login-link" href={resolve('/(auth)/login')} aria-label="로그인" title="로그인"
				><span class="login-text">로그인</span><span
					class="material-symbols-outlined login-icon"
					aria-hidden="true">login</span
				></a
			>
		{/if}
	</div>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-block: 1rem;
		border-bottom: 1px solid color-mix(in srgb, currentColor 18%, transparent);
	}

	.brand-row {
		display: flex;
		flex: none;
		align-items: center;
		gap: 0.5rem;
	}

	.logo {
		font-size: 1.5rem;
		white-space: nowrap;
	}

	.menu-button {
		display: none;
		padding: 0.35rem;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.nav-panel {
		flex: none;
	}

	.nav-backdrop {
		display: none;
	}

	.header-actions {
		display: flex;
		flex: none;
		align-items: center;
		gap: 0.75rem;
		white-space: nowrap;
	}

	.header-actions :is(a, button) {
		white-space: nowrap;
	}

	.login-icon {
		display: none;
	}

	.profile-icon,
	.logout-icon {
		display: none;
	}
	.login-link {
		display: inline-flex;
		align-items: center;
		color: inherit;
		text-decoration: none;
	}

	.profile-link {
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0.35rem 0.75rem;
		text-decoration: none;
	}

	form {
		margin: 0;
	}

	@media (max-width: 1110px) {
		header {
			gap: 0.5rem;
		}

		.logo {
			font-size: 1.25rem;
		}

		.menu-button {
			display: inline-flex;
			align-items: center;
		}

		.nav-panel {
			position: fixed;
			z-index: 30;
			top: 0;
			bottom: 0;
			left: 0;
			width: min(18rem, 82dvw);
			padding: 4rem 1rem 1rem;
			overflow-y: auto;
			background: Canvas;
			box-shadow: 0.75rem 0 1.5rem color-mix(in srgb, currentColor 18%, transparent);
			transform: translateX(-105%);
			transition: transform 0.18s ease;
		}

		.nav-panel.open {
			transform: translateX(0);
		}

		.nav-backdrop {
			position: fixed;
			z-index: 20;
			inset: 0;
			display: block;
			border: 0;
			background: color-mix(in srgb, CanvasText 30%, transparent);
		}

		.header-actions {
			gap: 0.4rem;
		}

		.profile-link {
			padding: 0.25rem;
		}
		.login-text {
			display: none;
		}

		.login-icon {
			display: inline-block;
		}

		.profile-text,
		.logout-text {
			display: none;
		}

		.profile-icon,
		.logout-icon {
			display: inline-block;
		}

		form button {
			padding: 0.35rem;
			border: 0;
			background: transparent;
			color: inherit;
		}
	}
</style>
