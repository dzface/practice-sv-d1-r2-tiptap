<script lang="ts">
	import { resolve } from '$app/paths';
	import PostEditor from '$lib/components/editor/PostEditor.svelte';
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();
	let formData = $derived(
		form as { message?: string; title?: string; body?: string; category?: string } | undefined
	);
	let selectedSlug = $derived(formData?.category ?? data.selectedCategory?.slug ?? '');
</script>

<svelte:head><title>글쓰기 · 릴토끼</title></svelte:head>

<section class="box write">
	<h1>글쓰기</h1>
	{#if data.writableCategories.length === 0}
		<p class="muted">글을 작성할 수 있는 게시판이 없습니다.</p>
	{:else}
		<form method="post" enctype="multipart/form-data">
			<label>
				게시판
				<select name="category" bind:value={selectedSlug}>
					{#each data.writableCategories as category (category.id)}
						<option value={category.slug}>{category.name}</option>
					{/each}
				</select>
			</label>
			<label>
				제목
				<input name="title" maxlength="120" required value={formData?.title ?? ''} />
			</label>
			<PostEditor initialHtml={formData?.body ?? ''} />
			{#if formData?.message}<p class="error">{formData.message}</p>{/if}
			<div class="actions">
				<button type="submit">등록</button>
				<a
					href={selectedSlug
						? resolve('/(app)/[category]', { category: selectedSlug })
						: resolve('/')}
				>
					취소
				</a>
			</div>
		</form>
	{/if}
</section>

<style>
	.write {
		max-width: 52rem;
	}

	form,
	label {
		display: grid;
		gap: 0.75rem;
	}

	input,
	select {
		font: inherit;
		padding: 0.65rem 0.75rem;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.actions :is(a, button) {
		display: inline-flex;
		min-height: 2rem;
		align-items: center;
		justify-content: center;
		padding: 0.35rem 0.75rem;
		border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
		border-radius: 0.25rem;
		background: ButtonFace;
		color: ButtonText;
		font: inherit;
		line-height: 1;
		text-decoration: none;
		cursor: pointer;
	}

	.error {
		color: #b42318;
	}
</style>
