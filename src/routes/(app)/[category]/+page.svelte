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

{#if data.posts.length}
	<ul class="post-list" aria-label={`${data.category.name} 글 목록`}>
		{#each data.posts as post (post.id)}
			<li>
				<a
					class="post-title"
					href={resolve('/(app)/[category]/[postId]', {
						category: data.category.slug,
						postId: post.id
					})}
				>
					{post.title}
				</a>
				<span class="meta">{post.commentCount} 👍{post.score}</span>
			</li>
		{/each}
	</ul>
{:else}
	<p class="muted">아직 등록된 게시글이 없습니다.</p>
{/if}

{#if data.pagination.totalPages > 1}
	<nav class="pagination" aria-label="페이지 이동">
		{#if data.pagination.previousPage}
			<a href={`?page=${data.pagination.previousPage}`} aria-label="이전 페이지">◀</a>
		{:else}
			<span aria-disabled="true">◀</span>
		{/if}

		{#each data.pagination.pages as page}
			{#if page === data.pagination.page}
				<span aria-current="page">{page}</span>
			{:else}
				<a href={`?page=${page}`}>{page}</a>
			{/if}
		{/each}

		{#if data.pagination.nextPage}
			<a href={`?page=${data.pagination.nextPage}`} aria-label="다음 페이지">▶</a>
		{:else}
			<span aria-disabled="true">▶</span>
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

	.post-list {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
	}

	.post-list li {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-block: 0.7rem;
		border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
	}

	.post-title {
		overflow: hidden;
		flex: 1;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.meta {
		flex: none;
		opacity: 0.75;
		white-space: nowrap;
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
