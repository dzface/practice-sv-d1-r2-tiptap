<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor, Extension, Mark, Node as TiptapNode, mergeAttributes } from '@tiptap/core';
	import Link from '@tiptap/extension-link';
	import StarterKit from '@tiptap/starter-kit';

	let { initialHtml = '', name = 'body' }: { initialHtml?: string; name?: string } = $props();

	const headingLevels = [1, 2, 3, 4, 5, 6] as const;
	const colors = ['#111827', '#dc2626', '#2563eb', '#16a34a', '#ca8a04'] as const;
	const highlights = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecdd3'] as const;
	const fonts = ['system-ui', 'serif', 'monospace'] as const;
	const fontSizes = ['14px', '16px', '20px', '28px'] as const;

	const TextStyle = Mark.create({
		name: 'textStyle',
		addAttributes() {
			return {
				style: {
					default: null,
					parseHTML: (element) => element.getAttribute('style'),
					renderHTML: (attributes) => (attributes.style ? { style: attributes.style } : {})
				}
			};
		},
		parseHTML() {
			return [{ tag: 'span[style]' }];
		},
		renderHTML({ HTMLAttributes }) {
			return ['span', mergeAttributes(HTMLAttributes), 0];
		}
	});

	const Subscript = Mark.create({
		name: 'subscript',
		parseHTML: () => [{ tag: 'sub' }],
		renderHTML: () => ['sub', 0]
	});

	const Superscript = Mark.create({
		name: 'superscript',
		parseHTML: () => [{ tag: 'sup' }],
		renderHTML: () => ['sup', 0]
	});

	const TextAlign = Extension.create({
		name: 'textAlign',
		addGlobalAttributes() {
			return [
				{
					types: ['heading', 'paragraph'],
					attributes: {
						style: {
							default: null,
							parseHTML: (element) => element.getAttribute('style'),
							renderHTML: (attributes) => (attributes.style ? { style: attributes.style } : {})
						}
					}
				}
			];
		}
	});

	const Image = TiptapNode.create({
		name: 'image',
		group: 'block',
		atom: true,
		addAttributes() {
			return {
				src: { default: null },
				alt: { default: null }
			};
		},
		parseHTML: () => [{ tag: 'img[src]' }],
		renderHTML: ({ HTMLAttributes }) => ['img', mergeAttributes(HTMLAttributes)]
	});

	const Youtube = TiptapNode.create({
		name: 'youtube',
		group: 'block',
		atom: true,
		addAttributes() {
			return { src: { default: null } };
		},
		parseHTML: () => [{ tag: 'iframe[src*="youtube.com/embed"]' }],
		renderHTML: ({ HTMLAttributes }) => [
			'iframe',
			mergeAttributes(HTMLAttributes, {
				allowfullscreen: 'true'
			})
		]
	});

	const Table = TiptapNode.create({
		name: 'table',
		group: 'block',
		content: 'tableRow+',
		parseHTML: () => [{ tag: 'table' }],
		renderHTML: () => ['table', ['tbody', 0]]
	});

	const TableRow = TiptapNode.create({
		name: 'tableRow',
		content: '(tableCell | tableHeader)+',
		parseHTML: () => [{ tag: 'tr' }],
		renderHTML: () => ['tr', 0]
	});

	const TableHeader = TiptapNode.create({
		name: 'tableHeader',
		content: 'paragraph+',
		parseHTML: () => [{ tag: 'th' }],
		renderHTML: () => ['th', 0]
	});

	const TableCell = TiptapNode.create({
		name: 'tableCell',
		content: 'paragraph+',
		parseHTML: () => [{ tag: 'td' }],
		renderHTML: () => ['td', 0]
	});

	const TaskList = TiptapNode.create({
		name: 'taskList',
		group: 'block',
		content: 'taskItem+',
		parseHTML: () => [{ tag: 'ul[data-type="taskList"]' }],
		renderHTML: () => ['ul', { 'data-type': 'taskList' }, 0]
	});

	const TaskItem = TiptapNode.create({
		name: 'taskItem',
		content: 'paragraph block*',
		parseHTML: () => [{ tag: 'li[data-type="taskItem"]' }],
		renderHTML: () => ['li', { 'data-type': 'taskItem' }, 0]
	});

	let element: HTMLDivElement;
	let editor = $state<Editor | null>(null);
	let html = $state('');
	let characters = $state(0);
	let words = $state(0);

	function sync(editor: Editor) {
		html = editor.getHTML();
		const text = editor.getText();
		characters = text.length;
		words = text.trim() ? text.trim().split(/\s+/).length : 0;
	}

	function promptUrl(message: string) {
		const value = prompt(message);
		return value?.trim();
	}

	function setLink() {
		const href = promptUrl('링크 URL');
		if (!href) return;
		editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
	}

	function insertImage() {
		const src = promptUrl('이미지 URL');
		if (!src) return;
		editor?.chain().focus().insertContent(`<img src="${src}">`).run();
	}

	function insertYoutube() {
		const url = promptUrl('유튜브 URL');
		const id = url?.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]+)/)?.[1];
		if (!id) return;
		editor
			?.chain()
			.focus()
			.insertContent(`<iframe src="https://www.youtube.com/embed/${id}"></iframe>`)
			.run();
	}

	function insertTable() {
		editor
			?.chain()
			.focus()
			.insertContent(
				'<table><tbody><tr><th><p>제목</p></th><th><p>제목</p></th></tr><tr><td><p>내용</p></td><td><p>내용</p></td></tr></tbody></table>'
			)
			.run();
	}

	function insertMention() {
		const name = promptUrl('사용자명');
		if (!name) return;
		editor
			?.chain()
			.focus()
			.insertContent(`<span style="color:#2563eb">@${name.replace(/^@/, '')}</span>`)
			.run();
	}

	function setStyle(style: string) {
		editor?.chain().focus().setMark('textStyle', { style }).run();
	}

	function setAlign(align: string) {
		editor
			?.chain()
			.focus()
			.updateAttributes('paragraph', { style: `text-align:${align}` })
			.run();
		editor
			?.chain()
			.focus()
			.updateAttributes('heading', { style: `text-align:${align}` })
			.run();
	}

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [
				StarterKit,
				Link.configure({
					openOnClick: false,
					autolink: true
				}),
				TextStyle,
				Subscript,
				Superscript,
				TextAlign,
				Image,
				Youtube,
				Table,
				TableRow,
				TableHeader,
				TableCell,
				TaskList,
				TaskItem
			],
			content: initialHtml,
			editorProps: {
				attributes: {
					'data-placeholder': '본문을 입력하세요'
				}
			},
			onUpdate: ({ editor }: { editor: Editor }) => sync(editor)
		});
		sync(editor);
	});

	onDestroy(() => {
		editor?.destroy();
	});
</script>

<div class="toolbar" aria-label="글쓰기 도구">
	<button type="button" onclick={() => editor?.chain().focus().undo().run()}>되돌리기</button>
	<button type="button" onclick={() => editor?.chain().focus().redo().run()}>다시실행</button>
	<button
		type="button"
		class:active={editor?.isActive('bold')}
		onclick={() => editor?.chain().focus().toggleBold().run()}>굵게</button
	>
	<button
		type="button"
		class:active={editor?.isActive('italic')}
		onclick={() => editor?.chain().focus().toggleItalic().run()}>기울임</button
	>
	<button
		type="button"
		class:active={editor?.isActive('strike')}
		onclick={() => editor?.chain().focus().toggleStrike().run()}>취소선</button
	>
	<button
		type="button"
		class:active={editor?.isActive('underline')}
		onclick={() => editor?.chain().focus().toggleUnderline().run()}>밑줄</button
	>
	<button
		type="button"
		class:active={editor?.isActive('code')}
		onclick={() => editor?.chain().focus().toggleCode().run()}>인라인코드</button
	>
	<button type="button" onclick={setLink}>링크</button>
	<button type="button" onclick={() => editor?.chain().focus().unsetLink().run()}>링크해제</button>
	<button type="button" onclick={() => editor?.chain().focus().toggleMark('subscript').run()}
		>아래첨자</button
	>
	<button type="button" onclick={() => editor?.chain().focus().toggleMark('superscript').run()}
		>위첨자</button
	>
	<button type="button" onclick={() => editor?.chain().focus().setParagraph().run()}>문단</button>
	{#each headingLevels as level}
		<button type="button" onclick={() => editor?.chain().focus().toggleHeading({ level }).run()}
			>H{level}</button
		>
	{/each}
	<button type="button" onclick={() => editor?.chain().focus().toggleBlockquote().run()}
		>인용</button
	>
	<button type="button" onclick={() => editor?.chain().focus().toggleCodeBlock().run()}
		>코드블록</button
	>
	<button type="button" onclick={() => editor?.chain().focus().setHardBreak().run()}>줄바꿈</button>
	<button type="button" onclick={() => editor?.chain().focus().setHorizontalRule().run()}
		>구분선</button
	>
	<button type="button" onclick={() => editor?.chain().focus().toggleBulletList().run()}
		>글머리</button
	>
	<button type="button" onclick={() => editor?.chain().focus().toggleOrderedList().run()}
		>번호</button
	>
	<button
		type="button"
		onclick={() =>
			editor
				?.chain()
				.focus()
				.insertContent('<ul data-type="taskList"><li data-type="taskItem"><p>할 일</p></li></ul>')
				.run()}>할일</button
	>
	<button type="button" onclick={insertImage}>이미지</button>
	<button type="button" onclick={insertYoutube}>유튜브</button>
	<button type="button" onclick={insertTable}>표</button>
	<button type="button" onclick={insertMention}>멘션</button>
	{#each colors as color}
		<button type="button" onclick={() => setStyle(`color:${color}`)}>색상 {color}</button>
	{/each}
	{#each highlights as color}
		<button type="button" onclick={() => setStyle(`background-color:${color}`)}>형광 {color}</button
		>
	{/each}
	{#each fonts as font}
		<button type="button" onclick={() => setStyle(`font-family:${font}`)}>폰트 {font}</button>
	{/each}
	{#each fontSizes as size}
		<button type="button" onclick={() => setStyle(`font-size:${size}`)}>크기 {size}</button>
	{/each}
	<button type="button" onclick={() => setAlign('left')}>왼쪽</button>
	<button type="button" onclick={() => setAlign('center')}>가운데</button>
	<button type="button" onclick={() => setAlign('right')}>오른쪽</button>
	<button type="button" onclick={() => setAlign('justify')}>양끝</button>
</div>

<div bind:this={element} class="editor" aria-label="본문"></div>
<p class="counter">글자 {characters} · 단어 {words}</p>
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

	.editor :global(.ProseMirror:empty::before) {
		content: attr(data-placeholder);
		opacity: 0.55;
		pointer-events: none;
	}

	.editor :global(img),
	.editor :global(iframe) {
		max-width: 100%;
	}

	.editor :global(table) {
		width: 100%;
		border-collapse: collapse;
	}

	.editor :global(th),
	.editor :global(td) {
		border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
		padding: 0.5rem;
	}

	.editor :global(ul[data-type='taskList']) {
		list-style: '☐ ';
	}

	.counter {
		margin-block: 0.5rem;
		opacity: 0.7;
	}
</style>
