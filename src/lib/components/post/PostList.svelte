<script lang="ts">
	import { resolve } from '$app/paths';

	type PostListItem = {
		id: string;
		title: string;
		viewCount: number;
		commentCount: number;
		score: number;
	};

	let {
		posts,
		categorySlug,
		ariaLabel,
		compact = false
	}: {
		posts: PostListItem[];
		categorySlug: string;
		ariaLabel: string;
		compact?: boolean;
	} = $props();
</script>

<ul class:compact aria-label={ariaLabel}>
	{#each posts as post (post.id)}
		<li>
			<a
				class="post-title"
				href={resolve('/(app)/[category]/[postId]', {
					category: categorySlug,
					postId: post.id
				})}
			>
				{post.title}
			</a>
			<span class="post-meta" aria-label={`댓글 ${post.commentCount}, 좋아요 ${post.score}`}>
				💬{post.commentCount} 👍{post.score}
			</span>
		</li>
	{/each}
</ul>

<style>
	ul {
		margin: 1rem 0 0;
		padding: 0;
		list-style: none;
	}

	ul.compact {
		min-height: calc(10 * 2.25rem);
		margin: 0;
	}

	li {
		display: flex;
		align-items: center;
		gap: 1rem;
		min-width: 0;
		padding-block: 0.7rem;
		border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
	}

	.compact li {
		gap: 0.75rem;
		height: 2.25rem;
		padding-block: 0;
		border-bottom-color: color-mix(in srgb, currentColor 10%, transparent);
	}

	.post-title {
		overflow: hidden;
		flex: 1;
		min-width: 0;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.post-meta {
		flex: none;
		opacity: 0.75;
		white-space: nowrap;
	}

	.compact .post-meta {
		font-size: 0.8rem;
	}
</style>
