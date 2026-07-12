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
</script>

<header>
	<a class="logo" href={resolve('/')}><strong>Lil-tokki</strong></a>
	<Nav {groups} />
	<div class="header-actions">
		<ThemeToggle />
		{#if user}
			{#if user.profile}
				<a class="profile-link" href={resolve('/(app)/profile')}>{user.profile.nickname}</a>
			{:else}
				<a class="profile-link" href={resolve('/(app)/profile/setup')}>닉네임 설정</a>
			{/if}
			<form method="post" action="/logout">
				<button type="submit">로그아웃</button>
			</form>
		{:else}
			<a href={resolve('/(auth)/login')}>로그인</a>
		{/if}
	</div>
</header>

<style>
	.logo{
		font-size: 1.5rem;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-block: 1rem;
		border-bottom: 1px solid color-mix(in srgb, currentColor 18%, transparent);
	}

	header > :global(.board-nav) {
		flex: 1;
	}

	.header-actions {
		display: flex;
		flex: none;
		align-items: center;
		gap: 0.75rem;
	}

	@media (max-width: 48rem) {
		header {
			flex-wrap: wrap;
		}

		header > :global(.board-nav) {
			order: 3;
			flex-basis: 100%;
		}
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
</style>
