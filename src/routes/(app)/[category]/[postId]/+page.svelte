<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
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

	beforeNavigate(flushVotes);
	onMount(() => {
		addEventListener('pagehide', flushVotes);
		return () => removeEventListener('pagehide', flushVotes);
	});
	onDestroy(flushVotes);
</script>

<svelte:head><title>{data.post.title} - 릴토끼</title></svelte:head>

{#if data.editPost && data.post.canManage}
	<form method="POST" action="?/updatePost" class="box">
		<label for="post-title">제목</label>
		<input id="post-title" name="title" value={data.post.title} maxlength="120" required />
		<p class="field-label">본문</p>
		<PostEditor initialHtml={data.post.body} />
		{#if form?.form === 'updatePost'}<p class="error">{form.message}</p>{/if}
		<div class="actions">
			<button type="submit">수정 완료</button>
			<a href={`/${data.category.slug}/${data.post.id}`}>취소</a>
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
		<div class="post-body">{@html data.post.body}</div>

		{#if data.post.canManage}
			<div class="actions">
				<a href="?editPost=1">수정</a>
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
			type="button"
			aria-pressed={postVote.vote === 1}
			onclick={() => applyClientVote(postVote, 1)}
		>
			좋아요 {postVote.upvoteCount}
		</button>
		<button
			type="button"
			aria-pressed={postVote.vote === -1}
			onclick={() => applyClientVote(postVote, -1)}
		>
			싫어요 {postVote.downvoteCount}
		</button>
	</div>
	{#if postVote.message}<p class="vote-message">{postVote.message}</p>{/if}
</section>

<section class="box">
	<h2>댓글 {data.comments.length}</h2>
	{#each data.comments as comment}
		{@const editingComment = data.editCommentId === comment.id}
		<article class="comment item">
			<p class="muted">{comment.authorName}</p>
			{#if editingComment && comment.canManage}
				<form method="POST" action="?/updateComment">
					<input type="hidden" name="commentId" value={comment.id} />
					<textarea name="body" rows="4" maxlength="1000">{comment.body}</textarea>
					{#if form?.form === 'updateComment'}<p class="error">{form.message}</p>{/if}
					<div class="actions">
						<button type="submit">수정 완료</button>
						<a href={`/${data.category.slug}/${data.post.id}`}>취소</a>
					</div>
				</form>
			{:else}
				<p>{comment.body}</p>
				<div class="actions comment-actions">
					<button
						type="button"
						aria-pressed={commentVotes[comment.id]?.vote === 1}
						onclick={() => applyClientVote(commentVotes[comment.id], 1)}
					>
						좋아요 {commentVotes[comment.id]?.upvoteCount ?? comment.upvoteCount}
					</button>
					<button
						type="button"
						aria-pressed={commentVotes[comment.id]?.vote === -1}
						onclick={() => applyClientVote(commentVotes[comment.id], -1)}
					>
						싫어요 {commentVotes[comment.id]?.downvoteCount ?? comment.downvoteCount}
					</button>
					{#if comment.canManage}
						<a href="?editComment={comment.id}">수정</a>
						<form method="POST" action="?/deleteComment">
							<input type="hidden" name="commentId" value={comment.id} />
							<button type="submit">삭제</button>
						</form>
					{/if}
				</div>
				{#if commentVotes[comment.id]?.message}<p class="vote-message">
						{commentVotes[comment.id].message}
					</p>{/if}
			{/if}
		</article>
	{:else}
		<p class="muted">아직 댓글이 없습니다.</p>
	{/each}
</section>

{#if data.user?.profile}
	<form method="POST" action="?/createComment" class="box">
		<label for="comment-body">댓글</label>
		<textarea id="comment-body" name="body" rows="4" maxlength="1000"
			>{form?.form === 'createComment' ? (form.body ?? '') : ''}</textarea
		>
		{#if form?.form === 'createComment'}<p class="error">{form.message}</p>{/if}
		<button type="submit">등록</button>
	</form>
{:else}
	<p class="box muted"><a href="/login">로그인</a> 후 댓글을 작성할 수 있습니다.</p>
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

	.comment p {
		margin-block: 0.25rem;
		white-space: pre-wrap;
	}

	.comment-actions {
		margin-top: 0.5rem;
	}

	.error,
	.vote-message {
		color: #b00020;
	}

	.vote-message {
		margin-block: 0.5rem 0;
	}
</style>
