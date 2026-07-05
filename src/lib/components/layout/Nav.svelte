<script lang="ts">
	import { resolve } from '$app/paths';
	import type { CategoryGroup } from '$lib/categories/category';

	let { groups }: { groups: CategoryGroup[] } = $props();
</script>

<nav aria-label="게시판">
	{#each groups as group (group.name)}
		<section class="item" aria-labelledby={`nav-${group.name}`}>
			<strong id={`nav-${group.name}`}>{group.name}</strong>
			{#each group.categories as category (category.id)}
				<a href={resolve('/(app)/[category]', { category: category.slug })}>{category.name}</a>
			{/each}
		</section>
	{/each}
</nav>

<style>
	section {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	strong {
		min-width: 7rem;
	}
</style>
