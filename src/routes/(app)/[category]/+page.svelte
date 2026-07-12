<script lang="ts">
	import { resolve } from '$app/paths';
	import PostList from '$lib/components/post/PostList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const categoryHref = $derived(resolve('/(app)/[category]', { category: data.category.slug }));
	const writeHref = $derived(`${resolve('/(app)/write')}?category=${data.category.slug}`);

	function pageHref(page: number) {
		return `${categoryHref}?page=${page}`;
	}
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<svelte:head><title>{data.category.name} - 릴토끼</title></svelte:head>

<div class="category-head">
	<h1>{data.category.name}</h1>
	{#if data.canWrite}
		<a class="write-link" href={writeHref}>글쓰기</a>
	{/if}
</div>

{#if data.posts.length}
	<PostList
		posts={data.posts}
		categorySlug={data.category.slug}
		ariaLabel={`${data.category.name} 글 목록`}
	/>
{:else}
	<p class="muted">아직 등록된 게시글이 없습니다.</p>
{/if}

{#if data.pagination.totalPages > 1}
	<nav class="pagination" aria-label="페이지 이동">
		{#if data.pagination.previousPage}
			<a href={pageHref(data.pagination.previousPage)} aria-label="이전 페이지">‹</a>
		{:else}
			<span aria-disabled="true">‹</span>
		{/if}

		{#each data.pagination.pages as page (page)}
			{#if page === data.pagination.page}
				<span aria-current="page">{page}</span>
			{:else}
				<a href={pageHref(page)}>{page}</a>
			{/if}
		{/each}

		{#if data.pagination.nextPage}
			<a href={pageHref(data.pagination.nextPage)} aria-label="다음 페이지">›</a>
		{:else}
			<span aria-disabled="true">›</span>
		{/if}
	</nav>
{/if}

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

	.pagination {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		margin-block: 1.5rem;
	}

	.pagination a,
	.pagination span {
		min-width: 1.5rem;
		text-align: center;
	}

	.pagination [aria-current='page'] {
		font-weight: 700;
		text-decoration: underline;
	}

	.pagination [aria-disabled='true'] {
		opacity: 0.35;
	}
</style>
