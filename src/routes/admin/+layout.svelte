<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head><title>관리자 콘솔 - 릴토끼</title></svelte:head>

<div class="admin-shell">
	<aside class="admin-sidebar" aria-label="관리자 메뉴">
		<a class="admin-brand" href="/admin">관리자 콘솔</a>
		{#each data.menuGroups as group (group.label)}
			<nav aria-label={group.label}>
				<h2>{group.label}</h2>
				{#each group.items as item (item.id)}
					{#if item.disabled}
						<span class="side-link disabled">{item.label}</span>
					{:else}
						<a class:active={data.currentPath === item.href} class="side-link" href={item.href}>
							{item.label}
						</a>
					{/if}
				{/each}
			</nav>
		{/each}
	</aside>

	<main class="admin-main">
		<div class="admin-topbar">
			<strong>{data.adminUser.profile?.nickname ?? data.adminUser.name}</strong>
			<a href="/">사이트로 이동</a>
		</div>
		{@render children()}
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
	}

	.admin-shell {
		display: grid;
		grid-template-columns: 15rem minmax(0, 1fr);
		min-height: 100dvh;
		background: Canvas;
		color: CanvasText;
	}

	.admin-sidebar {
		display: grid;
		align-content: start;
		gap: 1rem;
		border-right: 1px solid color-mix(in srgb, currentColor 16%, transparent);
		padding: 1rem;
	}

	.admin-brand {
		color: inherit;
		font-size: 1.25rem;
		font-weight: 800;
		text-decoration: none;
	}

	.admin-sidebar h2 {
		margin: 0 0 0.35rem;
		color: color-mix(in srgb, CanvasText 62%, transparent);
		font-size: 0.9rem;
	}

	.side-link {
		display: block;
		border-radius: 0.375rem;
		color: inherit;
		padding: 0.45rem 0.55rem;
		text-decoration: none;
	}

	.side-link:hover,
	.side-link:focus,
	.side-link.active {
		background: color-mix(in srgb, currentColor 10%, transparent);
		outline: none;
	}

	.side-link.disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.admin-main {
		display: grid;
		align-content: start;
		gap: 1.5rem;
		min-width: 0;
		padding: 1.25rem;
	}

	.admin-topbar {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		padding-bottom: 0.75rem;
	}

	.admin-topbar a {
		color: inherit;
	}

	:global(.admin-page) {
		display: grid;
		gap: 1rem;
	}

	:global(.page-header) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		justify-content: space-between;
	}

	:global(.page-header h1),
	:global(.admin-page h1) {
		margin-block: 0 0.35rem;
	}

	:global(.page-header p),
	:global(.muted),
	:global(.admin-row-main p) {
		color: color-mix(in srgb, CanvasText 62%, transparent);
	}

	:global(.admin-section) {
		display: grid;
		gap: 0.75rem;
		border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		padding-bottom: 1rem;
	}

	:global(.filter-grid),
	:global(.point-event-grid),
	:global(.point-settings) {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.65rem;
	}

	:global(.filter-grid label),
	:global(.point-event-grid label),
	:global(.point-settings label) {
		display: grid;
		gap: 0.25rem;
		min-width: 0;
	}

	:global(.check-row) {
		grid-template-columns: auto 1fr;
		align-items: center;
	}

	:global(input),
	:global(select) {
		min-width: 0;
		padding: 0.4rem 0.5rem;
	}

	:global(.header-actions),
	:global(.admin-actions) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	:global(.header-actions a),
	:global(.header-actions button),
	:global(.admin-actions button),
	:global(.page-header button) {
		padding: 0.4rem 0.65rem;
	}

	:global(.admin-list) {
		display: grid;
		gap: 0.75rem;
	}

	:global(.admin-row) {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.75rem;
		align-items: start;
		border-bottom: 1px solid color-mix(in srgb, currentColor 14%, transparent);
		padding-block: 0.75rem;
	}

	:global(.admin-row-main) {
		min-width: 0;
	}

	:global(.admin-row-main strong),
	:global(.admin-row-main p) {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.status-pill) {
		border-radius: 999px;
		background: color-mix(in srgb, #16a34a 16%, transparent);
		padding: 0.2rem 0.55rem;
		font-size: 0.85rem;
		white-space: nowrap;
	}

	:global(.status-hidden) {
		background: color-mix(in srgb, #f59e0b 20%, transparent);
	}

	:global(.status-deleted) {
		background: color-mix(in srgb, #ef4444 18%, transparent);
	}

	:global(.admin-actions) {
		grid-column: 1 / -1;
	}

	:global(.admin-actions input) {
		min-width: 12rem;
		flex: 1;
	}

	:global(.audit-list) {
		display: grid;
		gap: 0.5rem;
	}

	:global(.audit-list p) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0;
	}

	:global(.error) {
		color: #dc2626;
	}
	@media (max-width: 900px) {
		.admin-shell {
			grid-template-columns: 1fr;
		}

		.admin-sidebar {
			border-right: 0;
			border-bottom: 1px solid color-mix(in srgb, currentColor 16%, transparent);
		}
	}

	@media (max-width: 768px) {
		:global(.filter-grid),
		:global(.point-event-grid),
		:global(.point-settings),
		:global(.admin-row) {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
