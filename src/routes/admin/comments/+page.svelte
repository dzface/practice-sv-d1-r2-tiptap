<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	function formatDate(value: Date | string) {
		const date = new Date(value);
		return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	}

	function statusLabel(status: string) {
		if (status === 'public') return '공개';
		if (status === 'hidden') return '숨김';
		if (status === 'deleted') return '삭제';
		return status;
	}
</script>

<section class="admin-page">
	<h1>댓글</h1>
	{#if form?.message}<p class="error">{form.message}</p>{/if}
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
					class="status-pill">{statusLabel(comment.status)}</span
				>
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
