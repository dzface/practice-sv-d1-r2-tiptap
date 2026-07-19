<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Editor, Extension, Mark, Node as TiptapNode, mergeAttributes } from '@tiptap/core';
	import type { NodeViewRendererProps } from '@tiptap/core';
	import Link from '@tiptap/extension-link';
	import StarterKit from '@tiptap/starter-kit';

	type EditorAttachment = {
		id?: string;
		key?: string;
		name: string;
		type: string;
		size: number;
		url: string;
		listed?: boolean;
	};

	let {
		initialHtml = '',
		initialAttachments = [],
		name = 'body'
	}: { initialHtml?: string; initialAttachments?: EditorAttachment[]; name?: string } = $props();

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

	function mergeImageWidth(styleText: string | null, width: number) {
		const style = document.createElement('span').style;
		if (styleText) style.cssText = styleText;
		style.setProperty('width', `${Math.max(80, Math.round(width))}px`);
		return style.cssText;
	}

	function imageNodeView({ node, editor, getPos }: NodeViewRendererProps) {
		let currentNode = node;
		let startX = 0;
		let startWidth = 0;
		const dom = document.createElement('span');
		const img = document.createElement('img');
		const handle = document.createElement('span');

		dom.className = 'resizable-image';
		dom.contentEditable = 'false';
		handle.className = 'material-symbols-outlined image-resize-handle';
		handle.contentEditable = 'false';
		handle.textContent = 'open_in_full';
		dom.appendChild(img);
		dom.appendChild(handle);

		function render() {
			img.src = String(currentNode.attrs.src ?? '');
			img.alt = String(currentNode.attrs.alt ?? '');
			img.style.cssText = String(currentNode.attrs.style ?? '');
		}

		function saveWidth(width: number) {
			const pos = getPos();
			if (typeof pos !== 'number') return;
			editor.view.dispatch(
				editor.view.state.tr.setNodeMarkup(pos, undefined, {
					...currentNode.attrs,
					style: mergeImageWidth(String(currentNode.attrs.style ?? ''), width)
				})
			);
		}

		function move(event: MouseEvent) {
			const editorWidth = editor.view.dom.getBoundingClientRect().width;
			const width = Math.min(editorWidth, Math.max(80, startWidth + event.clientX - startX));
			img.style.width = `${Math.round(width)}px`;
		}

		function stop() {
			document.removeEventListener('mousemove', move);
			document.removeEventListener('mouseup', stop);
			saveWidth(img.getBoundingClientRect().width);
		}

		handle.addEventListener('mousedown', (event) => {
			event.preventDefault();
			startX = event.clientX;
			startWidth = img.getBoundingClientRect().width;
			document.addEventListener('mousemove', move);
			document.addEventListener('mouseup', stop);
		});

		render();
		return {
			dom,
			update(nextNode: typeof node) {
				if (nextNode.type.name !== 'image') return false;
				currentNode = nextNode;
				render();
				return true;
			},
			selectNode() {
				dom.classList.add('selected');
			},
			deselectNode() {
				dom.classList.remove('selected');
			},
			destroy() {
				document.removeEventListener('mousemove', move);
				document.removeEventListener('mouseup', stop);
			}
		};
	}

	const Image = TiptapNode.create({
		name: 'image',
		group: 'block',
		atom: true,
		addAttributes() {
			return {
				src: { default: null },
				alt: { default: null },
				style: {
					default: null,
					parseHTML: (element) => element.getAttribute('style'),
					renderHTML: (attributes) => (attributes.style ? { style: attributes.style } : {})
				}
			};
		},
		parseHTML: () => [{ tag: 'img[src]' }],
		renderHTML: ({ HTMLAttributes }) => ['img', mergeAttributes(HTMLAttributes)],
		addNodeView() {
			return imageNodeView;
		}
	});

	const Youtube = TiptapNode.create({
		name: 'youtube',
		group: 'block',
		atom: true,
		addAttributes() {
			return {
				src: { default: null },
				width: { default: null },
				height: { default: null },
				title: { default: null },
				frameborder: { default: null },
				allow: { default: null },
				referrerpolicy: { default: null },
				allowfullscreen: { default: true }
			};
		},
		parseHTML: () => [{ tag: 'iframe[src*="youtube.com/embed"]' }],
		renderHTML: ({ HTMLAttributes }) => [
			'iframe',
			mergeAttributes(HTMLAttributes, {
				allowfullscreen: 'true'
			})
		]
	});

	const Video = TiptapNode.create({
		name: 'video',
		group: 'block',
		atom: true,
		addAttributes() {
			return {
				src: { default: null },
				controls: { default: true }
			};
		},
		parseHTML: () => [{ tag: 'video[src]' }],
		renderHTML: ({ HTMLAttributes }) => [
			'video',
			mergeAttributes(HTMLAttributes, { controls: 'true' })
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
	let fileInput: HTMLInputElement;
	let editor = $state<Editor | null>(null);
	let html = $state('');
	let htmlSource = $state('');
	let attachments = $state<EditorAttachment[]>([]);
	let didLoadInitialAttachments = $state(false);
	let attachmentFiles: File[] = [];
	let isHtmlMode = $state(false);
	let characters = $state(0);
	let words = $state(0);
	let showColorPalette = $state(false);
	let showTablePicker = $state(false);
	let tableRows = $state(0);
	let tableCols = $state(0);
	let selectedFont = $state('');
	let selectedFontSize = $state('');
	let fileAccept = $state('image/*,video/*');
	let uploadMessage = $state('');
	let autosaveMessage = $state('');
	let autosaveTimer: ReturnType<typeof setInterval> | null = null;
	let submitForm: HTMLFormElement | null = null;

	$effect(() => {
		if (didLoadInitialAttachments) return;
		attachments = [...initialAttachments];
		didLoadInitialAttachments = true;
	});

	function sync(editor: Editor) {
		html = editor.getHTML();
		const text = editor.getText();
		characters = text.length;
		words = text.trim() ? text.trim().split(/\s+/).length : 0;
	}

	function autosaveKey() {
		return `liltokki-editor-draft:${location.pathname}:${name}`;
	}

	function formatSavedAt(date = new Date()) {
		const pad = (value: number) => String(value).padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
	}

	function draftHtml() {
		const current = isHtmlMode ? htmlSource : (editor?.getHTML() ?? '');
		return current
			.replace(/<video[^>]+src=(["'])blob:[\s\S]*?\1[^>]*><\/video>/gi, '')
			.replace(/<img[^>]+src=(["'])blob:[\s\S]*?\1[^>]*>/gi, '');
	}

	function saveDraft() {
		if (!editor || typeof localStorage === 'undefined') return;
		const savedAt = formatSavedAt();
		localStorage.setItem(
			autosaveKey(),
			JSON.stringify({
				html: draftHtml(),
				attachments: attachments.map(({ name, type, size }) => ({ name, type, size })),
				savedAt
			})
		);
		autosaveMessage = `임시저장 되었습니다. ${savedAt}`;
	}

	function clearDraft() {
		if (typeof localStorage !== 'undefined') localStorage.removeItem(autosaveKey());
	}

	function restoreDraft() {
		if (!editor || typeof localStorage === 'undefined') return;
		const raw = localStorage.getItem(autosaveKey());
		if (!raw) return;
		try {
			const draft = JSON.parse(raw) as { html?: string; savedAt?: string };
			if (!draft.html || draft.html === initialHtml) return;
			if (!confirm(`임시저장 글이 있습니다. 복구할까요?\n${draft.savedAt ?? ''}`)) return;
			editor.commands.setContent(draft.html);
			sync(editor);
			autosaveMessage = `임시저장 글을 복구했습니다. ${draft.savedAt ?? ''}`.trim();
		} catch {
			localStorage.removeItem(autosaveKey());
		}
	}

	function normalizeHref(value: string) {
		if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(value)) return value;
		return `https://${value}`;
	}

	function setLink() {
		const href = prompt('링크 URL')?.trim();
		if (!href) return;
		editor
			?.chain()
			.focus()
			.extendMarkRange('link')
			.setLink({ href: normalizeHref(href) })
			.run();
	}

	function escapeAttribute(value: string) {
		return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
	}

	function chooseFile(accept: string) {
		fileAccept = accept;
		uploadMessage = '';
		fileInput?.click();
	}

	function syncFileInput() {
		const transfer = new DataTransfer();
		for (const file of attachmentFiles) transfer.items.add(file);
		fileInput.files = transfer.files;
	}

	function attachFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = Array.from(input.files ?? []);
		for (const file of files) {
			if (file.size > 5 * 1024 * 1024) {
				uploadMessage = '파일은 5MB 이하만 첨부할 수 있습니다.';
				continue;
			}
			if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
				uploadMessage = '이미지 또는 동영상만 첨부할 수 있습니다.';
				continue;
			}

			const url = URL.createObjectURL(file);
			const attachment = {
				id: crypto.randomUUID(),
				name: file.name,
				type: file.type,
				size: file.size,
				url,
				listed: true
			};
			attachmentFiles = [...attachmentFiles, file];
			attachments = [...attachments, attachment];
			const src = escapeAttribute(url);
			const name = escapeAttribute(file.name);
			const tag = file.type.startsWith('image/')
				? `<img src="${src}" alt="${name}">`
				: `<video controls src="${src}"></video>`;
			editor?.chain().focus().insertContent(tag).run();
			uploadMessage = '';
		}
		syncFileInput();
	}

	function visibleAttachments() {
		return attachments.filter((attachment) => attachment.listed !== false);
	}

	function removeAttachmentFromList(index: number) {
		const target = visibleAttachments()[index];
		if (!target) return;
		attachments = attachments.map((attachment) =>
			attachment === target ? { ...attachment, listed: false } : attachment
		);
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
				Video,
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
		restoreDraft();
		autosaveTimer = setInterval(saveDraft, 5 * 60 * 1000);
		submitForm = element.closest('form');
		submitForm?.addEventListener('submit', clearDraft);
	});

	onDestroy(() => {
		if (autosaveTimer) clearInterval(autosaveTimer);
		submitForm?.removeEventListener('submit', clearDraft);
		editor?.destroy();
		for (const attachment of attachments) {
			if (!attachment.key) URL.revokeObjectURL(attachment.url);
		}
	});
</script>

<div class="toolbar" aria-label="글쓰기 도구">
	<div class="toolbar-main">
			<button type="button" title={isHtmlMode ? '글 편집' : 'HTML 수정'} onclick={toggleHtmlMode}>
			{isHtmlMode ? '' : ''}
			<span class="material-symbols-outlined">
		{isHtmlMode ? 'edit' : 'html'}
	</span>
		</button>
		{#if !isHtmlMode}
			<button
				type="button"
				title="되돌리기"
				aria-label="되돌리기"
				onclick={() => editor?.chain().focus().undo().run()}
				><span class="material-symbols-outlined" aria-hidden="true">undo</span></button
			>
			<button
				type="button"
				title="다시실행"
				aria-label="다시실행"
				onclick={() => editor?.chain().focus().redo().run()}
				><span class="material-symbols-outlined" aria-hidden="true">redo</span></button
			>
		{/if}
		{#if !isHtmlMode}
			<button
				type="button"
				title="이미지 첨부"
				aria-label="이미지 첨부"
				onclick={() => chooseFile('image/*')}
				><span class="material-symbols-outlined" aria-hidden="true">image</span></button
			>
			<button
				type="button"
				title="동영상 첨부"
				aria-label="동영상 첨부"
				onclick={() => chooseFile('video/*')}
				><span class="material-symbols-outlined" aria-hidden="true">movie</span></button
			>
			<span
				class="table-picker-wrap"
				role="group"
				aria-label="표 삽입"
				onmouseleave={() => ((tableRows = 0), (tableCols = 0))}
			>
				<button
					type="button"
					aria-expanded={showTablePicker}
					title="표"
					aria-label="표"
					onclick={() => (showTablePicker = !showTablePicker)}
					><span class="material-symbols-outlined" aria-hidden="true">table</span></button
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
		{/if}
	</div>

	{#if !isHtmlMode}
		<div class="toolbar-main">
			<button
				type="button"
				title="굵게"
				aria-label="굵게"
				class:active={editor?.isActive('bold')}
				onclick={() => editor?.chain().focus().toggleBold().run()}
				><span class="material-symbols-outlined" aria-hidden="true">format_bold</span></button
			>
			<button
				type="button"
				title="기울임"
				aria-label="기울임"
				class:active={editor?.isActive('italic')}
				onclick={() => editor?.chain().focus().toggleItalic().run()}
				><span class="material-symbols-outlined" aria-hidden="true">format_italic</span></button
			>
			<button
				type="button"
				title="취소선"
				aria-label="취소선"
				class:active={editor?.isActive('strike')}
				onclick={() => editor?.chain().focus().toggleStrike().run()}
				><span class="material-symbols-outlined" aria-hidden="true">strikethrough_s</span></button
			>
			<button
				type="button"
				title="밑줄"
				aria-label="밑줄"
				class:active={editor?.isActive('underline')}
				onclick={() => editor?.chain().focus().toggleUnderline().run()}
				><span class="material-symbols-outlined" aria-hidden="true">format_underlined</span></button
			>
			<button type="button" title="링크" aria-label="링크" onclick={setLink}
				><span class="material-symbols-outlined" aria-hidden="true">link</span></button
			>
			<button
				type="button"
				title="링크해제"
				aria-label="링크해제"
				onclick={() => editor?.chain().focus().unsetLink().run()}
				><span class="material-symbols-outlined" aria-hidden="true">link_off</span></button
			>
			<button type="button" onclick={() => editor?.chain().focus().toggleMark('subscript').run()}
				><span class="material-symbols-outlined"> subscript </span></button
			>
			<button type="button" onclick={() => editor?.chain().focus().toggleMark('superscript').run()}
				><span class="material-symbols-outlined"> superscript </span></button
			>
		</div>

		<div class="toolbar-main">
			<button type="button" title="왼쪽" aria-label="왼쪽" onclick={() => setAlign('left')}
				><span class="material-symbols-outlined" aria-hidden="true">format_align_left</span></button
			>
			<button type="button" title="가운데" aria-label="가운데" onclick={() => setAlign('center')}
				><span class="material-symbols-outlined" aria-hidden="true">format_align_center</span
				></button
			>
			<button type="button" title="오른쪽" aria-label="오른쪽" onclick={() => setAlign('right')}
				><span class="material-symbols-outlined" aria-hidden="true">format_align_right</span
				></button
			>
			<button type="button" title="양끝" aria-label="양끝" onclick={() => setAlign('justify')}
				><span class="material-symbols-outlined" aria-hidden="true">format_align_justify</span
				></button
			>
			<button
				type="button"
				title="코드블록"
				aria-label="코드블록"
				onclick={() => editor?.chain().focus().toggleCodeBlock().run()}
				><span class="material-symbols-outlined" aria-hidden="true">code_blocks</span></button
			>
			<button
				type="button"
				title="구분선"
				aria-label="구분선"
				onclick={() => editor?.chain().focus().setHorizontalRule().run()}
				><span class="material-symbols-outlined" aria-hidden="true">horizontal_rule</span></button
			>
			<button
				type="button"
				title="목록"
				aria-label="목록"
				onclick={() => editor?.chain().focus().toggleBulletList().run()}
				><span class="material-symbols-outlined" aria-hidden="true">format_list_bulleted</span
				></button
			>
			<button
				type="button"
				title="번호"
				aria-label="번호"
				onclick={() => editor?.chain().focus().toggleOrderedList().run()}
				><span class="material-symbols-outlined" aria-hidden="true">format_list_numbered</span
				></button
			>
		</div>
		<div class="toolbar-bottom">
			<label>
				<span class="material-symbols-outlined"> font_download </span>
				<select bind:value={selectedFont} onchange={selectFont}>
					<option value="">선택</option>
					{#each fonts as font (font.value)}
						<option value={font.value}>{font.label}</option>
					{/each}
				</select>
			</label>
			<label>
				<span class="material-symbols-outlined"> format_size </span>
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
					title="글자색"
					onclick={() => (showColorPalette = !showColorPalette)}
					><span class="material-symbols-outlined"> format_color_text </span></button
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

<input
	bind:this={fileInput}
	class="sr-only-file"
	type="file"
	name="attachmentFiles"
	accept={fileAccept}
	multiple
	onchange={attachFile}
/>
{#if uploadMessage}<p class="upload-message">{uploadMessage}</p>{/if}
{#if isHtmlMode}
	<textarea class="html-editor" bind:value={htmlSource} spellcheck="false" aria-label="HTML 본문"
	></textarea>
{/if}
<div bind:this={element} class:hidden={isHtmlMode} class="editor" aria-label="본문"></div>
<p class="counter">
	글자 {characters} · 단어 {words}{#if autosaveMessage}
		· {autosaveMessage}{/if}
</p>
{#if !isHtmlMode && visibleAttachments().length}
	<section class="editor-attachments" aria-label="첨부파일">
		<h2>첨부파일</h2>
		<ul>
			{#each visibleAttachments() as attachment, index (attachment.key ?? attachment.id)}
				<li>
					<button
						type="button"
						class="attachment-remove"
						aria-label={`${attachment.name} 첨부파일 목록에서 삭제`}
						onclick={() => removeAttachmentFromList(index)}>❌</button
					>
					<span>{attachment.name}</span>
					<span>({Math.ceil(attachment.size / 1024)}KB)</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}
<input type="hidden" {name} value={isHtmlMode ? htmlSource : html} />
<input type="hidden" name="attachments" value={JSON.stringify(attachments)} />

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

	.toolbar :global(.material-symbols-outlined) {
		display: block;
		font-size: 1.25rem;
		line-height: 1;
	}

	.sr-only-file {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
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

	.editor :global(a) {
		color: #2563eb;
		text-decoration: underline;
	}

	.editor :global(img),
	.editor :global(video),
	.editor :global(iframe) {
		max-width: 100%;
	}

	.editor :global(.resizable-image) {
		position: relative;
		display: inline-block;
		max-width: 100%;
		line-height: 0;
	}

	.editor :global(.resizable-image img) {
		display: block;
		min-width: 5rem;
		max-width: 100%;
	}

	.editor :global(.resizable-image.selected) {
		outline: 0.1px solid #9ca3af;
		outline-offset: 0.25rem;
	}

	.editor :global(.image-resize-handle) {
		position: absolute;
		right: -0.75rem;
		bottom: -0.75rem;
		display: none;
		width: 1.7rem;
		height: 1.7rem;
		align-items: center;
		justify-content: center;
		border: 0.1px solid #9ca3af;
		border-radius: 999px;
		background: white;
		color: #4b5563;
		box-shadow: 0 0 0 1px color-mix(in srgb, currentColor 28%, transparent);
		cursor: nwse-resize;
		font-size: 1rem;
		line-height: 1;
		user-select: none;
	}

	.editor :global(.resizable-image.selected .image-resize-handle) {
		display: inline-flex;
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

	.editor-attachments {
		margin-block: 0.75rem;
		padding: 0.75rem;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		border-radius: 0.375rem;
	}

	.editor-attachments h2 {
		margin-block: 0 0.5rem;
		font-size: 1rem;
	}

	.editor-attachments ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	.editor-attachments li {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.attachment-remove {
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
	}

	.upload-message {
		color: #b00020;
	}
</style>
