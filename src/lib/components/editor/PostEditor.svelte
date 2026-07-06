<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor } from '@tiptap/core';
	import Link from '@tiptap/extension-link';
	import StarterKit from '@tiptap/starter-kit';

	let { initialHtml = '', name = 'body' }: { initialHtml?: string; name?: string } = $props();

	let element: HTMLDivElement;
	let editor = $state<Editor | null>(null);
	let html = $state('');

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [
				StarterKit,
				Link.configure({
					openOnClick: false,
					autolink: true
				})
			],
			content: initialHtml,
			onUpdate: ({ editor }: { editor: Editor }) => {
				html = editor.getHTML();
			}
		});
		html = editor.getHTML();
	});

	onDestroy(() => {
		editor?.destroy();
	});
</script>

<div class="toolbar" aria-label="글쓰기 도구">
	<button type="button" class:active={editor?.isActive('bold')} onclick={() => editor?.chain().focus().toggleBold().run()}>
		굵게
	</button>
	<button type="button" class:active={editor?.isActive('italic')} onclick={() => editor?.chain().focus().toggleItalic().run()}>
		기울임
	</button>
	<button type="button" onclick={() => editor?.chain().focus().toggleBulletList().run()}>목록</button>
	<button type="button" onclick={() => editor?.chain().focus().toggleOrderedList().run()}>번호</button>
</div>

<div bind:this={element} class="editor" aria-label="본문"></div>
<input type="hidden" {name} value={html} />

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-block: 0.75rem;
	}

	.toolbar button.active {
		font-weight: 700;
	}

	.editor {
		min-height: 18rem;
		border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.editor :global(.ProseMirror) {
		min-height: 16rem;
		outline: none;
	}
</style>
