<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import { siteConfig } from '$lib/config/site.config';
	import '$lib/styles/global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{siteConfig.siteName}</title>
	<meta name="description" content={siteConfig.description} />
</svelte:head>

{@render children()}
