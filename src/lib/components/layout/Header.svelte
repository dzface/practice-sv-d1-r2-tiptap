<script lang="ts">
	import { resolve } from '$app/paths';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { siteConfig } from '$lib/config/site.config';

	type HeaderUser = {
		name: string;
		profile: { nickname: string } | null;
	};

	let { user }: { user: HeaderUser | null } = $props();
</script>

<header class="box">
	<a href={resolve('/')}><strong>{siteConfig.siteName}</strong></a>
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
	header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
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
