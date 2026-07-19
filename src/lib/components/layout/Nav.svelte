<script lang="ts">
	import { resolve } from '$app/paths';
	import type { CategoryGroup } from '$lib/categories/category';

	let { groups }: { groups: CategoryGroup[] } = $props();
</script>

<nav aria-label="게시판" class="board-nav">
	{#each groups as group (group.name)}
		{#if group.categories.length === 1}
			<a
				class="dropdown-toggle single-link"
				href={resolve('/(app)/[category]', { category: group.categories[0].slug })}
			>
				{group.name}
			</a>
		{:else}
			<details class="dropdown" open={group.name === '빅토끼'}>
				<summary class="dropdown-toggle">{group.name}</summary>
				<div class="dropdown-menu">
					{#each group.categories as category (category.id)}
						<a
							href={resolve('/(app)/[category]', { category: category.slug })}
							class="dropdown-item"
						>
							{category.name}
						</a>
					{/each}
				</div>
			</details>
		{/if}
	{/each}
</nav>

<style>
	.board-nav {
		display: flex;
		flex-wrap: nowrap;
		justify-content: center;
		gap: 0.35rem;
		color: inherit;
	}

	.dropdown,
	.single-link {
		position: relative;
		flex: none;
	}

	.dropdown-toggle {
		display: block;
		cursor: pointer;
		border: 0;
		border-radius: 0.375rem;
		background: transparent;
		color: inherit;
		padding: 0.45rem 0.6rem;
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
		list-style: none;
	}

	.dropdown-toggle::-webkit-details-marker {
		display: none;
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

	@media (max-width: 1110px) {
		.board-nav {
			flex-direction: column;
			align-items: stretch;
			justify-content: flex-start;
			gap: 0.75rem;
		}

		.dropdown,
		.single-link {
			display: block;
		}

		.dropdown-toggle {
			width: 100%;
			padding: 0.5rem 0;
			text-align: left;
		}

		.dropdown-menu {
			position: static;
			display: none;
			min-width: 0;
			padding: 0.1rem 0 0.2rem 0.75rem;
			border: 0;
			box-shadow: none;
		}

		.dropdown[open] .dropdown-menu {
			display: block;
		}
	}
</style>
