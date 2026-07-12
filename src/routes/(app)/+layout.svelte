<script lang="ts">
	import Aside from '$lib/components/layout/Aside.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="site-layout">
	<Aside />
	<div class="site-content">
		<div class="container">
			<Header groups={data.categoryGroups} user={data.user} />
		</div>
		<main class="site-main">
			<div class="container">{@render children()}</div>
		</main>
		<div class="container">
			<Footer />
		</div>
	</div>
	<Aside />
</div>
