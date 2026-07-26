<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function formatDate(value: Date | string) {
		const date = new Date(value);
		return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
	}

	function actionLabel(action: string) {
		if (action === 'hide') return '숨김';
		if (action === 'restore') return '복구';
		if (action === 'delete') return '삭제';
		if (action === 'role_change') return '권한변경';
		return action;
	}
</script>

<section class="admin-page">
	<h1>로그 이벤트</h1>
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
			<p class="muted">로그 이벤트가 없습니다.</p>
		{/each}
	</div>
</section>
