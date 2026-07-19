<script lang="ts">
	import HomeBoard from '$lib/components/post/HomeBoard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>릴토끼</title></svelte:head>

<h1 class="sr-only">게시판별 최신글</h1>
<div class="home-grid">
	{#each data.boards as board (board.id)}
		<HomeBoard {board} />
	{/each}
</div>

<style>
	.home-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem 1.5rem;
	}

	@media (min-width: 768px) {
		.home-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
