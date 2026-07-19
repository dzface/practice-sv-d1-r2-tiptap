<script lang="ts">
	import { resolve } from '$app/paths';
	import type { HomeBoard as HomeBoardData } from '$lib/server/posts/home-posts';
	import PostList from './PostList.svelte';

	let { board }: { board: HomeBoardData } = $props();
</script>

<section class="home-board box">
	<h2><a href={resolve('/(app)/[category]', { category: board.slug })}>{board.name}</a></h2>
	<PostList
		posts={board.posts}
		categorySlug={board.slug}
		ariaLabel={`${board.name} 최신글`}
		compact
	/>
</section>

<style>
	.home-board {
		min-width: 0;
	}

	h2 {
		margin-block: 0 0.5rem;
		font-size: 1.05rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
