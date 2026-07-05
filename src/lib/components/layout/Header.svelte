<script lang="ts">
	import { resolve } from '$app/paths';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { siteConfig } from '$lib/config/site.config';

	let { user }: { user: { name: string } | null } = $props();
</script>

<header class="container box">
	<a href={resolve('/')}><strong>{siteConfig.siteName}</strong></a>
	<div class="header-actions">
		<ThemeToggle />
		{#if user}
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

	form {
		margin: 0;
	}
</style>
