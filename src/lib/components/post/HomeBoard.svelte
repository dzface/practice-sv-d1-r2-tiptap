<script lang="ts">
	import { resolve } from '$app/paths';
	import type { HomeBoard as HomeBoardData } from '$lib/server/posts/home-posts';

	let { board }: { board: HomeBoardData } = $props();
</script>

<section class="home-board box">
	<h2><a href={resolve('/(app)/[category]', { category: board.slug })}>{board.name}</a></h2>
	<ul aria-label={`${board.name} 최신글`}>
		{#each board.posts as post (post.id)}
			<li>
				<a
					class="post-title"
					href={resolve('/(app)/[category]/[postId]', {
						category: board.slug,
						postId: post.id
					})}>{post.title}</a
				>
				<span class="post-meta" aria-label={`댓글 ${post.commentCount}, 좋아요 ${post.score}`}>
					{post.commentCount} 👍{post.score}
				</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	.home-board {
		min-width: 0;
	}

	h2 {
		margin-block: 0 0.5rem;
		font-size: 1.05rem;
	}

	ul {
		min-height: calc(10 * 2.25rem);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		height: 2.25rem;
		border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
	}

	.post-title {
		overflow: hidden;
		flex: 1;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.post-meta {
		flex: none;
		font-size: 0.8rem;
		opacity: 0.75;
	}
</style>
