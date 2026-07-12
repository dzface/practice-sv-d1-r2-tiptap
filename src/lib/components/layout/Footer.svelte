<script lang="ts">
	import { resolve } from '$app/paths';
	import { siteConfig } from '$lib/config/site.config';
</script>

<footer class="box">
	<nav aria-label="정책">
		<a href={resolve('/policy')}>운영정책</a>
		<a href={resolve('/privacy')}>개인정보처리방침</a>
	</nav>
	<small class="muted">© {new Date().getFullYear()} {siteConfig.companyName}</small>
</footer>

<style>
	footer,
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	footer {
		border-top: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		justify-content: space-between;
		margin: 1rem 0 0 0;
	}
</style>
