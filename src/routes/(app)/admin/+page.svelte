<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	function formatDate(value: Date | string) {
		const date = new Date(value);
		return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
			date.getDate()
		).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
			date.getMinutes()
		).padStart(2, '0')}`;
	}

	function statusLabel(status: string) {
		if (status === 'public') return '공개';
		if (status === 'hidden') return '숨김';
		if (status === 'deleted') return '삭제';
		return status;
	}

	function actionLabel(action: string) {
		if (action === 'hide') return '숨김';
		if (action === 'restore') return '복구';
		if (action === 'delete') return '삭제';
		return action;
	}
</script>

<svelte:head><title>운영관리 - 릴토끼</title></svelte:head>

<section class="admin-page">
	<header class="admin-header">
		<h1>운영관리</h1>
		<p>최근 게시글과 댓글을 숨김, 복구, 삭제 처리합니다.</p>
	</header>

	{#if form?.message}<p class="error">{form.message}</p>{/if}

	<section class="admin-section" aria-labelledby="admin-posts-title">
		<h2 id="admin-posts-title">게시글</h2>
		<div class="admin-list">
			{#each data.posts as post (post.id)}
				<article class="admin-row">
					<div class="admin-row-main">
						<strong>{post.title}</strong>
						<p>
							{post.categoryName ?? '게시판 없음'} · {post.authorName} · {formatDate(
								post.createdAt
							)}
						</p>
					</div>
					<span
						class:status-hidden={post.status === 'hidden'}
						class:status-deleted={post.status === 'deleted'}
						class="status-pill"
					>
						{statusLabel(post.status)}
					</span>
					<form method="POST" action="?/moderatePost" class="admin-actions">
						<input type="hidden" name="postId" value={post.id} />
						<input name="reason" placeholder="사유" maxlength="500" />
						<button name="action" value="hide" type="submit">숨김</button>
						<button name="action" value="restore" type="submit">복구</button>
						<button name="action" value="delete" type="submit">삭제</button>
					</form>
				</article>
			{:else}
				<p class="muted">게시글이 없습니다.</p>
			{/each}
		</div>
	</section>

	<section class="admin-section" aria-labelledby="admin-comments-title">
		<h2 id="admin-comments-title">댓글</h2>
		<div class="admin-list">
			{#each data.comments as comment (comment.id)}
				<article class="admin-row">
					<div class="admin-row-main">
						<strong>{comment.body}</strong>
						<p>
							{comment.postTitle ?? '게시글 없음'} · {comment.authorName} · {formatDate(
								comment.createdAt
							)}
						</p>
					</div>
					<span
						class:status-hidden={comment.status === 'hidden'}
						class:status-deleted={comment.status === 'deleted'}
						class="status-pill"
					>
						{statusLabel(comment.status)}
					</span>
					<form method="POST" action="?/moderateComment" class="admin-actions">
						<input type="hidden" name="commentId" value={comment.id} />
						<input name="reason" placeholder="사유" maxlength="500" />
						<button name="action" value="hide" type="submit">숨김</button>
						<button name="action" value="restore" type="submit">복구</button>
						<button name="action" value="delete" type="submit">삭제</button>
					</form>
				</article>
			{:else}
				<p class="muted">댓글이 없습니다.</p>
			{/each}
		</div>
	</section>

	<section class="admin-section" aria-labelledby="admin-audit-title">
		<h2 id="admin-audit-title">감사기록</h2>
		<div class="audit-list">
			{#each data.auditLogs as log (log.id)}
				<p>
					<strong>{actionLabel(log.action)}</strong>
					<span>{log.targetType}</span>
					<code>{log.targetId}</code>
					<span>{formatDate(log.createdAt)}</span>
					{#if log.reason}<span>{log.reason}</span>{/if}
				</p>
			{:else}
				<p class="muted">감사기록이 없습니다.</p>
			{/each}
		</div>
	</section>
</section>

<style>
	.admin-page {
		display: grid;
		gap: 1.5rem;
	}

	.admin-header h1,
	.admin-section h2 {
		margin-block: 0 0.5rem;
	}

	.admin-header p,
	.admin-row-main p,
	.muted {
		color: color-mix(in srgb, CanvasText 62%, transparent);
	}

	.admin-section {
		display: grid;
		gap: 0.75rem;
	}

	.admin-list {
		display: grid;
		gap: 0.75rem;
	}

	.admin-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.75rem;
		align-items: start;
		border-bottom: 1px solid color-mix(in srgb, currentColor 14%, transparent);
		padding-block: 0.75rem;
	}

	.admin-row-main {
		min-width: 0;
	}

	.admin-row-main strong,
	.admin-row-main p {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.status-pill {
		border-radius: 999px;
		background: color-mix(in srgb, #16a34a 16%, transparent);
		padding: 0.2rem 0.55rem;
		font-size: 0.85rem;
		white-space: nowrap;
	}

	.status-hidden {
		background: color-mix(in srgb, #f59e0b 20%, transparent);
	}

	.status-deleted {
		background: color-mix(in srgb, #ef4444 18%, transparent);
	}

	.admin-actions {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.admin-actions input {
		min-width: 12rem;
		flex: 1;
		padding: 0.4rem 0.5rem;
	}

	.admin-actions button {
		padding: 0.4rem 0.65rem;
	}

	.audit-list {
		display: grid;
		gap: 0.5rem;
	}

	.audit-list p {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0;
	}

	.error {
		color: #dc2626;
	}

	@media (max-width: 768px) {
		.admin-row {
			grid-template-columns: minmax(0, 1fr);
		}

		.status-pill {
			width: fit-content;
		}
	}
</style>
