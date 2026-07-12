<script lang="ts">
	import Aside from '$lib/components/layout/Aside.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Nav from '$lib/components/layout/Nav.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="site-layout">
	<Aside />
	<div class="site-content">
		<div class="container">
			<Header user={data.user} />
		</div>
		<div class="container">
			<div class="box">
				<Nav groups={data.categoryGroups} />
			</div>
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
