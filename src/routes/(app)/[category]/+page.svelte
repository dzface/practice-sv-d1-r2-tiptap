<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.category.name} · 릴토끼</title></svelte:head>

<div class="category-head">
	<h1>{data.category.name}</h1>
	{#if data.canWrite}
		<a class="write-link" href={`${resolve('/(app)/write')}?category=${data.category.slug}`}>글쓰기</a>
	{/if}
</div>

<p class="muted">아직 등록된 게시글이 없습니다.</p>

<style>
	.category-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.write-link {
		border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
		border-radius: 999px;
		padding: 0.45rem 0.8rem;
		text-decoration: none;
	}
</style>
