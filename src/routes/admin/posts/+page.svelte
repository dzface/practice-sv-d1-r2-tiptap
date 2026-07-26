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
	<h1>게시판</h1>
	{#if form?.message}<p class="error">{form.message}</p>{/if}
	<div class="admin-list">
		{#each data.posts as post (post.id)}
			<article class="admin-row">
				<div class="admin-row-main">
					<strong>{post.title}</strong>
					<p>
						{post.categoryName ?? '게시판 없음'} · {post.authorName} · {formatDate(post.createdAt)}
					</p>
				</div>
				<span
					class:status-hidden={post.status === 'hidden'}
					class:status-deleted={post.status === 'deleted'}
					class="status-pill">{statusLabel(post.status)}</span
				>
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
