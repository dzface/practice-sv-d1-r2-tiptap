<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor, Extension, Mark, Node as TiptapNode, mergeAttributes } from '@tiptap/core';
	import Link from '@tiptap/extension-link';
	import StarterKit from '@tiptap/starter-kit';

	let { initialHtml = '', name = 'body' }: { initialHtml?: string; name?: string } = $props();

	const headingLevels = [1, 2, 3, 4, 5, 6] as const;
	const textColors = [
		'#000000',
		'#FFFAFA',
		'#FF0800',
		'#FF4F00',
		'#FFEF00',
		'#00FF7F',
		'#00563B',
		'#4666FF',
		'#000080',
		'#9400D3'
	] as const;
	const fonts = [
		{ label: '기본', value: 'system-ui' },
		{ label: '라인고딕', value: 'LineSeed' },
		{ label: '리디바탕', value: 'Ridibatang' },
		{ label: '부크크명조', value: 'BookkMyungjo' },
		{ label: '지마켓산스', value: 'GMarketSans' },
		{ label: '교보손글씨2019', value: 'KyoboHandwriting2019' },
		{ label: '독립체', value: 'Independent' },
		{ label: '도스이야기', value: 'DosStory' },
		{ label: 'D2Coding', value: 'D2Coding' }
	] as const;
	const fontSizes = ['8px', '12px', '16px', '20px', '24px', '28px', '32px'] as const;
	const tableGrid = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

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
	let htmlSource = $state('');
	let isHtmlMode = $state(false);
	let characters = $state(0);
	let words = $state(0);
	let showColorPalette = $state(false);
	let showTablePicker = $state(false);
	let tableRows = $state(0);
	let tableCols = $state(0);
	let selectedFont = $state('');
	let selectedFontSize = $state('');

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

	function insertTable(rows = 2, cols = 2) {
		const body = Array.from({ length: rows }, (_, row) => {
			const tag = row === 0 ? 'th' : 'td';
			const cells = Array.from({ length: cols }, () => `<${tag}><p></p></${tag}>`).join('');
			return `<tr>${cells}</tr>`;
		}).join('');

		editor?.chain().focus().insertContent(`<table><tbody>${body}</tbody></table>`).run();
		showTablePicker = false;
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

	function setStyle(property: string, value: string) {
		if (!editor) return;

		const style = document.createElement('span').style;
		const currentStyle = editor.getAttributes('textStyle').style;
		if (typeof currentStyle === 'string') style.cssText = currentStyle;
		style.setProperty(property, value);

		editor.chain().focus().setMark('textStyle', { style: style.cssText }).run();
	}

	function toggleHtmlMode() {
		if (!editor) return;

		if (isHtmlMode) {
			editor.commands.setContent(htmlSource);
			sync(editor);
		} else {
			htmlSource = html;
		}

		isHtmlMode = !isHtmlMode;
	}

	function setTextColor(color: string) {
		setStyle('color', color);
		showColorPalette = false;
	}

	function selectFont(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value;
		if (!value) return;
		setStyle('font-family', value);
	}

	function selectFontSize(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value;
		if (!value) return;
		setStyle('font-size', value);
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
	<div class="toolbar-main">
		<button type="button" onclick={() => editor?.chain().focus().undo().run()}>되돌리기</button>
		<button type="button" onclick={() => editor?.chain().focus().redo().run()}>다시실행</button>
		<button type="button" onclick={toggleHtmlMode}>{isHtmlMode ? '편집' : 'HTML 수정'}</button>
	</div>

	{#if !isHtmlMode}
		<div class="toolbar-main">
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
			<button type="button" onclick={() => editor?.chain().focus().unsetLink().run()}
				>링크해제</button
			>
			<button type="button" onclick={() => editor?.chain().focus().toggleMark('subscript').run()}
				>아래첨자</button
			>
			<button type="button" onclick={() => editor?.chain().focus().toggleMark('superscript').run()}
				>위첨자</button
			>
		</div>

		<div class="toolbar-main">
			<button type="button" onclick={() => editor?.chain().focus().setParagraph().run()}
				>문단</button
			>
			{#each headingLevels as level (level)}
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
			<button type="button" onclick={() => editor?.chain().focus().setHardBreak().run()}
				>줄바꿈</button
			>
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
						.insertContent(
							'<ul data-type="taskList"><li data-type="taskItem"><p>할 일</p></li></ul>'
						)
						.run()}>할일</button
			>
		</div>

		<div class="toolbar-main">
			<button type="button" onclick={insertImage}>이미지</button>
			<button type="button" onclick={insertYoutube}>유튜브</button>
			<span
				class="table-picker-wrap"
				role="group"
				aria-label="표 삽입"
				onmouseleave={() => ((tableRows = 0), (tableCols = 0))}
			>
				<button
					type="button"
					aria-expanded={showTablePicker}
					onclick={() => (showTablePicker = !showTablePicker)}>표</button
				>
				{#if showTablePicker}
					<span class="table-picker" role="dialog" aria-label="표 크기 선택">
						<span class="table-picker-label">{tableRows || 0} x {tableCols || 0}</span>
						<span class="table-picker-grid">
							{#each tableGrid as row (row)}
								{#each tableGrid as col (col)}
									<button
										type="button"
										class:active={row <= tableRows && col <= tableCols}
										aria-label={`${row}행 ${col}열 표 삽입`}
										onmouseenter={() => ((tableRows = row), (tableCols = col))}
										onclick={() => insertTable(row, col)}
									></button>
								{/each}
							{/each}
						</span>
					</span>
				{/if}
			</span>
			<button type="button" onclick={insertMention}>멘션</button>
		</div>

		<div class="toolbar-main">
			<button type="button" onclick={() => setAlign('left')}>왼쪽</button>
			<button type="button" onclick={() => setAlign('center')}>가운데</button>
			<button type="button" onclick={() => setAlign('right')}>오른쪽</button>
			<button type="button" onclick={() => setAlign('justify')}>양끝</button>
		</div>

		<div class="toolbar-bottom">
			<label>
				글자체
				<select bind:value={selectedFont} onchange={selectFont}>
					<option value="">선택</option>
					{#each fonts as font (font.value)}
						<option value={font.value}>{font.label}</option>
					{/each}
				</select>
			</label>
			<label>
				글자크기
				<select bind:value={selectedFontSize} onchange={selectFontSize}>
					<option value="">선택</option>
					{#each fontSizes as size (size)}
						<option value={size}>{size}</option>
					{/each}
				</select>
			</label>
			<span class="palette-wrap">
				<button
					type="button"
					aria-expanded={showColorPalette}
					onclick={() => (showColorPalette = !showColorPalette)}>글자색</button
				>
				{#if showColorPalette}
					<span class="palette" role="dialog" aria-label="글자색 선택">
						{#each textColors as color (color)}
							<button
								type="button"
								class="swatch"
								style={`background-color:${color}`}
								aria-label={`글자색 ${color}`}
								onclick={() => setTextColor(color)}
							></button>
						{/each}
					</span>
				{/if}
			</span>
		</div>
	{/if}
</div>

{#if isHtmlMode}
	<textarea class="html-editor" bind:value={htmlSource} spellcheck="false" aria-label="HTML 본문"
	></textarea>
{/if}
<div bind:this={element} class:hidden={isHtmlMode} class="editor" aria-label="본문"></div>
<p class="counter">글자 {characters} · 단어 {words}</p>
<input type="hidden" {name} value={isHtmlMode ? htmlSource : html} />

<style>
	.toolbar {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-block: 0.75rem;
	}

	.toolbar-main,
	.toolbar-bottom {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.toolbar-bottom {
		padding-top: 0.25rem;
	}

	.toolbar-bottom label {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.toolbar button.active {
		font-weight: 700;
	}

	.palette-wrap {
		position: relative;
		display: inline-flex;
	}

	.table-picker-wrap {
		position: relative;
		display: inline-flex;
	}

	.palette {
		position: absolute;
		z-index: 2;
		top: calc(100% + 0.35rem);
		left: 0;
		display: grid;
		grid-template-columns: repeat(5, 1.5rem);
		gap: 0.35rem;
		width: max-content;
		padding: 0.5rem;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 0.375rem;
		background: Canvas;
		box-shadow: 0 0.5rem 1.5rem color-mix(in srgb, currentColor 16%, transparent);
	}

	.table-picker {
		position: absolute;
		z-index: 2;
		top: calc(100% + 0.35rem);
		left: 0;
		display: grid;
		gap: 0.45rem;
		width: max-content;
		padding: 0.6rem;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 0.375rem;
		background: Canvas;
		box-shadow: 0 0.5rem 1.5rem color-mix(in srgb, currentColor 16%, transparent);
	}

	.table-picker-label {
		font-size: 0.85rem;
		opacity: 0.75;
	}

	.table-picker-grid {
		display: grid;
		grid-template-columns: repeat(10, 1rem);
		gap: 0.2rem;
	}

	.toolbar .table-picker-grid button {
		width: 1rem;
		height: 1rem;
		padding: 0;
		border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
		border-radius: 0.125rem;
		background: transparent;
	}

	.toolbar .table-picker-grid button.active {
		background: #2563eb;
		border-color: #2563eb;
	}

	.toolbar .swatch {
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
		border-radius: 0.2rem;
	}

	.editor {
		min-height: 18rem;
		border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.editor.hidden {
		display: none;
	}

	.html-editor {
		width: 100%;
		min-height: 18rem;
		border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
		border-radius: 0.5rem;
		background: #1f2933;
		color: #e5e7eb;
		padding: 1rem;
		font-family: monospace;
		resize: vertical;
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

	.editor :global(pre) {
		position: relative;
		margin-block: 1rem;
		overflow: auto;
		border-radius: 0.4rem;
		background: #252a33;
		color: #e5e7eb;
		padding: 3.5rem 1.25rem 1rem;
		font-size: 0.95rem;
		line-height: 1.7;
	}

	.editor :global(pre)::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 3rem;
		background:
			radial-gradient(circle at 1.4rem 50%, #ff5f56 0 0.38rem, transparent 0.42rem),
			radial-gradient(circle at 2.9rem 50%, #ffbd2e 0 0.38rem, transparent 0.42rem),
			radial-gradient(circle at 4.4rem 50%, #27c93f 0 0.38rem, transparent 0.42rem), #373a45;
	}

	.editor :global(pre)::after {
		content: 'CODE';
		position: absolute;
		top: 0.85rem;
		right: 1rem;
		color: #facc15;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0;
	}

	.editor :global(pre code) {
		position: relative;
		display: block;
		color: inherit;
		background: transparent;
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
