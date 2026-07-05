<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.post.title} · 릴토끼</title></svelte:head>

<article class="box">
	<p class="muted">{data.category.name}</p>
	<h1>{data.post.title}</h1>
	<p class="muted">
		{data.post.authorName} · 조회 {data.post.viewCount} · 순추천
		{data.post.upvoteCount - data.post.downvoteCount}
	</p>
	<div class="post-body">{data.post.body}</div>
</article>

<style>
	.post-body {
		margin-top: 2rem;
		white-space: pre-wrap;
	}
</style>
