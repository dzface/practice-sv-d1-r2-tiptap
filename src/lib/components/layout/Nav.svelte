<script lang="ts">
	import { resolve } from '$app/paths';
	import type { CategoryGroup } from '$lib/categories/category';

	let { groups }: { groups: CategoryGroup[] } = $props();
</script>

<nav aria-label="게시판" class="board-nav">
	{#each groups as group (group.name)}
		<div class="dropdown">
			<button type="button" class="dropdown-toggle" id={`nav-${group.name}`} aria-expanded="false">
				{group.name}
			</button>

			<div class="dropdown-menu" aria-labelledby={`nav-${group.name}`}>
				{#each group.categories as category (category.id)}
					<a href={resolve('/(app)/[category]', { category: category.slug })} class="dropdown-item">
						{category.name}
					</a>
				{/each}
			</div>
		</div>
	{/each}
</nav>

<style>
	.board-nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		color: inherit;
	}

	.dropdown {
		position: relative;
		display: inline-block;
	}

	.dropdown-toggle {
		cursor: pointer;
		border: 0px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 0.375rem;
		background: transparent;
		color: inherit;
		padding: 0.45rem 0.75rem;
		font-weight: 700;
	}

	.dropdown-menu {
		position: absolute;
		z-index: 10;
		top: 100%;
		left: 0;
		display: none;
		min-width: 10rem;
		padding: 0.35rem 0;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 0.375rem;
		background: Canvas;
		color: CanvasText;
		box-shadow: 0 0.5rem 1.25rem color-mix(in srgb, currentColor 16%, transparent);
	}

	.dropdown-item {
		display: block;
		padding: 0.6rem 0.85rem;
		color: inherit;
		text-decoration: none;
		white-space: nowrap;
	}

	.dropdown-item:hover,
	.dropdown-item:focus {
		background: color-mix(in srgb, currentColor 10%, transparent);
		outline: none;
	}

	.dropdown:hover .dropdown-menu,
	.dropdown:focus-within .dropdown-menu {
		display: block;
	}
</style>
