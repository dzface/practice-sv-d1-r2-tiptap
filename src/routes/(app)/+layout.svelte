<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Nav from '$lib/components/layout/Nav.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Header user={data.user} />
<div class="container box"><Nav groups={data.categoryGroups} /></div>
<main class="container site-main">{@render children()}</main>
<Footer />
