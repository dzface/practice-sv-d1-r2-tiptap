<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import PostEditor from '$lib/components/editor/PostEditor.svelte';
	import {
		applyVote,
		nextClientVote,
		type StoredVoteValue,
		type VoteValue
	} from '$lib/votes/vote-state';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	type VoteState = {
		upvoteCount: number;
		downvoteCount: number;
		vote: StoredVoteValue;
		persistedVote: StoredVoteValue;
		message: string;
	};

	const canVote = $derived(Boolean(data.user?.profile));

	function initialPostVote() {
		return {
			upvoteCount: data.post.upvoteCount,
			downvoteCount: data.post.downvoteCount,
			vote: data.post.vote,
			persistedVote: data.post.vote,
			message: ''
		};
	}

	function initialCommentVotes() {
		return Object.fromEntries(
			data.comments.map((comment) => [
				comment.id,
				{
					upvoteCount: comment.upvoteCount,
					downvoteCount: comment.downvoteCount,
					vote: comment.vote,
					persistedVote: comment.vote,
					message: ''
				}
			])
		);
	}

	let postVote = $state<VoteState>(initialPostVote());
	let commentVotes = $state<Record<string, VoteState>>(initialCommentVotes());
	let threadedComments = $derived(orderComments(data.comments));
	let publicCommentCount = $derived(
		data.comments.filter((comment) => comment.status === 'public').length
	);
	let failedReplyParentId = $derived(getFailedReplyParentId());

	function voteValue(value: StoredVoteValue) {
		if (value === null) return 'none';
		return value === 1 ? 'up' : 'down';
	}

	function sendVote(action: string, fields: Record<string, string>) {
		const body = new FormData();
		for (const [key, value] of Object.entries(fields)) body.set(key, value);
		if (!navigator.sendBeacon(action, body)) {
			void fetch(action, { method: 'POST', body, keepalive: true });
		}
	}

	function flushVotes() {
		if (typeof navigator === 'undefined') return;

		if (postVote.vote !== postVote.persistedVote) {
			sendVote('?/votePost', { value: voteValue(postVote.vote) });
			postVote.persistedVote = postVote.vote;
		}

		for (const [commentId, state] of Object.entries(commentVotes)) {
			if (state.vote === state.persistedVote) continue;
			sendVote('?/voteComment', { commentId, value: voteValue(state.vote) });
			state.persistedVote = state.vote;
		}
	}

	function applyClientVote(state: VoteState, clickedVote: VoteValue) {
		if (!canVote) {
			state.message = '로그인 후 투표할 수 있습니다.';
			return;
		}

		const next = nextClientVote(state.vote, clickedVote);
		state.message = next.message ?? '';
		if (next.vote === state.vote) return;

		const counts = applyVote(state, state.vote, next.vote);
		state.upvoteCount = counts.upvoteCount;
		state.downvoteCount = counts.downvoteCount;
		state.vote = next.vote;
	}

	function postHref() {
		return resolve('/(app)/[category]/[postId]', {
			category: data.category.slug,
			postId: data.post.id
		});
	}

	function attachmentDownloadHref(attachment: { key: string; name: string }) {
		return `${resolve('/(app)/media/file/[...key]', { key: attachment.key })}?download=1&name=${encodeURIComponent(attachment.name)}`;
	}

	function editPostHref() {
		return `${postHref()}?editPost=1`;
	}

	function editCommentHref(commentId: string) {
		return `${postHref()}?editComment=${commentId}`;
	}

	function getFailedReplyParentId() {
		if (form?.form !== 'createComment') return '';
		return 'parentCommentId' in form ? String(form.parentCommentId ?? '') : '';
	}

	function relativeTime(value: Date | string) {
		const date = new Date(value);
		const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60)));
		if (diffMinutes <= 1) return '방금 전';
		if (diffMinutes <= 60) return `${Math.ceil(diffMinutes / 10) * 10}분 전`;

		const diffHours = Math.floor(diffMinutes / 60);
		if (diffHours < 24) return `${diffHours}시간 전`;

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}.${month}.${day}`;
	}

	function levelFor(points: number | null) {
		const value = points ?? 0;
		if (value >= 1500) return 5;
		if (value >= 700) return 4;
		if (value >= 300) return 3;
		if (value >= 100) return 2;
		return 1;
	}

	function levelSrc(points: number | null) {
		return `/levels/level-${levelFor(points)}.svg`;
	}

	function orderComments(comments: typeof data.comments) {
		const byId = new Map(comments.map((comment) => [comment.id, comment]));
		const children = new Map<string, typeof comments>();
		for (const comment of comments) {
			if (!comment.parentCommentId) continue;
			children.set(comment.parentCommentId, [
				...(children.get(comment.parentCommentId) ?? []),
				comment
			]);
		}

		const ordered: Array<
			(typeof comments)[number] & {
				replyToAuthorName: string | null;
				replyToAuthorPoints: number | null;
				replyToCreatedAt: Date | null;
				hasReplies: boolean;
			}
		> = [];

		function isVisible(comment: (typeof comments)[number]): boolean {
			return (
				comment.status === 'public' ||
				Boolean(children.get(comment.id)?.some((child) => isVisible(child)))
			);
		}

		function append(
			comment: (typeof comments)[number],
			replyToAuthorName: string | null,
			replyToAuthorPoints: number | null,
			replyToCreatedAt: Date | null
		) {
			ordered.push({
				...comment,
				replyToAuthorName,
				replyToAuthorPoints,
				replyToCreatedAt,
				hasReplies: Boolean(children.get(comment.id)?.length)
			});
			for (const child of children.get(comment.id) ?? [])
				if (isVisible(child))
					append(child, comment.authorName, comment.authorPoints, comment.createdAt);
		}

		for (const comment of comments) {
			if ((!comment.parentCommentId || !byId.has(comment.parentCommentId)) && isVisible(comment))
				append(comment, null, null, null);
		}
		return ordered;
	}

	beforeNavigate(flushVotes);
	onMount(() => {
		addEventListener('pagehide', flushVotes);
		return () => removeEventListener('pagehide', flushVotes);
	});
	onDestroy(flushVotes);
</script>

<svelte:head><title>{data.post.title} - 릴토끼</title></svelte:head>

{#if data.editPost && data.post.canManage}
	<form method="POST" action="?/updatePost" enctype="multipart/form-data" class="box">
		<label for="post-title">제목</label>
		<input id="post-title" name="title" value={data.post.title} maxlength="120" required />
		<p class="field-label">본문</p>
		<PostEditor initialHtml={data.post.body} initialAttachments={data.attachments} />
		{#if form?.form === 'updatePost'}<p class="error">{form.message}</p>{/if}
		<div class="actions">
			<button type="submit">수정 완료</button>
			<a href={postHref()}>취소</a>
		</div>
	</form>
{:else}
	<article class="box">
		<p class="muted">{data.category.name}</p>
		<h1>{data.post.title}</h1>
		<p class="post-meta muted">
			{data.post.authorName} · 조회 {data.post.viewCount} · 좋아요
			{postVote.upvoteCount - postVote.downvoteCount}
		</p>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="post-body">{@html data.post.body}</div>
		{#if data.attachments.length}
			<section class="attachments" aria-label="첨부파일">
				<h2>첨부파일</h2>
				<ul>
					{#each data.attachments as attachment (attachment.id)}
						<li>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={attachmentDownloadHref(attachment)} download={attachment.name}
								>{attachment.name}</a
							>
							<span class="muted">({Math.ceil(attachment.size / 1024)}KB)</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if data.post.canManage}
			<div class="actions">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={editPostHref()}>수정</a>
				<form method="POST" action="?/deletePost">
					<button type="submit">삭제</button>
				</form>
			</div>
			{#if form?.form === 'deletePost'}<p class="error">{form.message}</p>{/if}
		{/if}
	</article>
{/if}

<section class="box vote-bar" aria-label="게시글 투표">
	<div class="actions">
		<button
			class="vote-button"
			type="button"
			aria-pressed={postVote.vote === 1}
			onclick={() => applyClientVote(postVote, 1)}
		>
			<span>👍 좋아요</span>
			<strong class="up-count">{postVote.upvoteCount}</strong>
		</button>
		<button
			class="vote-button"
			type="button"
			aria-pressed={postVote.vote === -1}
			onclick={() => applyClientVote(postVote, -1)}
		>
			<span>👎 싫어요</span>
			<strong class="down-count">{postVote.downvoteCount}</strong>
		</button>
	</div>
	{#if postVote.message}<p class="vote-message">{postVote.message}</p>{/if}
</section>

<section class="box">
	<h2>댓글 {publicCommentCount}</h2>
	{#each threadedComments as comment (comment.id)}
		{@const editingComment = data.editCommentId === comment.id}
		<article class:reply-comment={comment.replyToAuthorName} class="comment item">
			{#if comment.replyToAuthorName}
				<div class="reply-parent">
					<span>
						<img
							src={levelSrc(comment.replyToAuthorPoints)}
							alt={`레벨 ${levelFor(comment.replyToAuthorPoints)}`}
						/>
						{comment.replyToAuthorName}
					</span>
					{#if comment.replyToCreatedAt}
						<time datetime={comment.replyToCreatedAt.toISOString()}
							>{relativeTime(comment.replyToCreatedAt)}</time
						>
					{/if}
				</div>
			{:else}
				<div class="reply-parent">
					<span>
						<img
							src={levelSrc(comment.authorPoints)}
							alt={`레벨 ${levelFor(comment.authorPoints)}`}
						/>
						{comment.authorName}
					</span>
					<time datetime={comment.createdAt.toISOString()}>{relativeTime(comment.createdAt)}</time>
				</div>
			{/if}
			{#if comment.status === 'deleted'}
				<p class="deleted-comment">삭제되었습니다</p>
			{:else}
				{#if editingComment && comment.canManage && !comment.hasReplies}
					<form method="POST" action="?/updateComment">
						<input type="hidden" name="commentId" value={comment.id} />
						<textarea name="body" rows="4" maxlength="1000">{comment.body}</textarea>
						{#if form?.form === 'updateComment'}<p class="error">{form.message}</p>{/if}
						<div class="actions">
							<button type="submit">수정 완료</button>
							<a href={postHref()}>취소</a>
						</div>
					</form>
				{:else}
					{#if comment.replyToAuthorName}
						<p class="reply-body"><span>@{comment.replyToAuthorName}</span> {comment.body}</p>
					{:else}
						<p>{comment.body}</p>
					{/if}
					<div class="actions comment-actions">
						<button
							class="comment-vote-button"
							type="button"
							aria-pressed={commentVotes[comment.id]?.vote === 1}
							onclick={() => applyClientVote(commentVotes[comment.id], 1)}
						>
							👍 {commentVotes[comment.id]?.upvoteCount ?? comment.upvoteCount}
						</button>
						<button
							class="comment-vote-button"
							type="button"
							aria-pressed={commentVotes[comment.id]?.vote === -1}
							onclick={() => applyClientVote(commentVotes[comment.id], -1)}
						>
							👎 {commentVotes[comment.id]?.downvoteCount ?? comment.downvoteCount}
						</button>
						{#if comment.canManage}
							{#if !comment.hasReplies}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={editCommentHref(comment.id)}>수정</a>
							{/if}
							<form method="POST" action="?/deleteComment">
								<input type="hidden" name="commentId" value={comment.id} />
								<button type="submit">삭제</button>
							</form>
						{/if}
					</div>
					{#if commentVotes[comment.id]?.message}<p class="vote-message">
							{commentVotes[comment.id].message}
						</p>{/if}
					{#if data.user?.profile}
						<details class="reply-form">
							<summary>답글</summary>
							<form method="POST" action="?/createComment">
								<input type="hidden" name="parentCommentId" value={comment.id} />
								<textarea name="body" rows="3" maxlength="1000"
									>{form?.form === 'createComment' && failedReplyParentId === comment.id
										? (form.body ?? '')
										: ''}</textarea
								>
								{#if form?.form === 'createComment' && failedReplyParentId === comment.id}
									<p class="error">{form.message}</p>
								{/if}
								<button type="submit">답글 등록</button>
							</form>
						</details>
					{/if}
				{/if}
			{/if}
		</article>
	{:else}
		<p class="muted">아직 댓글이 없습니다.</p>
	{/each}
</section>

{#if data.user?.profile}
	<form method="POST" action="?/createComment" class="box comment-form">
		<label for="comment-body">댓글</label>
		<textarea id="comment-body" name="body" rows="4" maxlength="1000"
			>{form?.form === 'createComment' && !failedReplyParentId ? (form.body ?? '') : ''}</textarea
		>
		{#if form?.form === 'createComment' && !failedReplyParentId}<p class="error">
				{form.message}
			</p>{/if}
		<button type="submit">등록</button>
	</form>
{:else}
	<p class="box muted">
		<a href={resolve('/(auth)/login')}>로그인</a> 후 댓글을 작성할 수 있습니다.
	</p>
{/if}

<style>
	.post-body {
		margin-top: 2rem;
		line-height: 1.75;
	}

	.post-meta {
		text-align: right;
	}

	.post-body :global(pre) {
		position: relative;
		margin-block: 1rem;
		overflow: auto;
		border-radius: 0.4rem;
		background: #252a33;
		color: #e5e7eb;
		padding: 3.5rem 1.25rem 1rem;
		font-size: 0.95rem;
		line-height: 1.7;
		white-space: pre;
	}

	.post-body :global(pre)::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 3rem;
		background:
			radial-gradient(circle at 1.4rem 50%, #ff5f56 0 0.38rem, transparent 0.42rem),
			radial-gradient(circle at 2.9rem 50%, #ffbd2e 0 0.38rem, transparent 0.42rem),
			radial-gradient(circle at 4.4rem 50%, #27c93f 0 0.38rem, transparent 0.42rem), #373a45;
	}

	.post-body :global(pre)::after {
		content: 'CODE';
		position: absolute;
		top: 0.85rem;
		right: 1rem;
		color: #facc15;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0;
	}

	.post-body :global(pre code) {
		position: relative;
		display: block;
		color: inherit;
		background: transparent;
	}

	.post-body :global(table) {
		width: 100%;
		border-collapse: collapse;
	}

	.post-body :global(img),
	.post-body :global(video) {
		max-width: 100%;
	}

	.post-body :global(a) {
		color: #2563eb;
		text-decoration: underline;
	}

	.attachments {
		margin-top: 2rem;
	}

	.attachments h2 {
		font-size: 1rem;
	}

	.post-body :global(th),
	.post-body :global(td) {
		border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
		padding: 0.5rem;
	}

	form {
		display: grid;
		gap: 0.75rem;
	}

	input,
	textarea {
		width: 100%;
	}

	textarea {
		resize: vertical;
	}

	.actions,
	.actions form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
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

	.comment p {
		margin-block: 0.25rem;
		white-space: pre-wrap;
	}

	.deleted-comment {
		color: #8a8f98;
		font-style: italic;
	}

	.reply-parent img {
		width: 1.1rem;
		height: 1.1rem;
	}

	.reply-comment {
		margin-left: 1rem;
	}

	.reply-parent {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.5rem;
		padding: 0.4rem 0.6rem;
		border-radius: 0.25rem;
		background: #e5e5e5;
		color: #111827;
	}

	.reply-parent span {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.reply-parent time {
		color: #8a8f98;
		white-space: nowrap;
	}

	.reply-body span {
		padding: 0.15rem 0.4rem;
		border-radius: 999px;
		background: #eaf2ff;
		color: #2563eb;
		font-weight: 600;
	}

	.comment-actions {
		margin-top: 0.5rem;
		justify-content: flex-start;
	}

	.comment-actions .comment-vote-button {
		min-height: auto;
		padding: 0;
		border: 0;
		background: transparent;
		color: inherit;
	}

	.reply-form {
		margin-top: 0.75rem;
	}

	.reply-form form {
		display: grid;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.reply-form button {
		justify-self: end;
		width: auto;
		padding: 0.35rem 0.85rem;
	}

	.vote-bar .actions {
		justify-content: center;
	}

	.vote-bar .vote-button {
		gap: 0.6rem;
		min-height: 2.75rem;
		padding: 0.5rem 1rem;
		border: 0;
		border: 0.2rem solid #888;
		border-radius: 999px;
		font-weight: 600;
	}

	.vote-bar .vote-button[aria-pressed='true'] {
		background: #888;
	}

	.vote-bar .vote-button strong {
		font-weight: 800;
	}

	.up-count {
		color: #00ff1a;
	}

	.down-count {
		color: #ff5b69;
	}

	.comment-form {
		display: grid;
		gap: 0.75rem;
	}

	.comment-form button {
		justify-self: end;
		width: auto;
		padding: 0.35rem 0.85rem;
	}

	.error,
	.vote-message {
		color: #b00020;
	}

	.vote-message {
		margin-block: 0.5rem 0;
	}
</style>
