<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<section class="admin-page">
	<form method="POST" class="point-form">
		<div class="page-header">
			<h1>포인트</h1>
			<button type="submit">설정저장</button>
		</div>
		{#if form?.message}<p class="message">{form.message}</p>{/if}
		<section class="admin-section point-settings">
			<label class="check-row"
				><input
					name="blockDownloadForUsers"
					type="checkbox"
					checked={data.settings.blockDownloadForUsers}
				/> 일반 user role 회원 다운로드 금지</label
			>
			<label class="check-row"
				><input
					name="blockReadForUsers"
					type="checkbox"
					checked={data.settings.blockReadForUsers}
				/> 일반 user role 회원 글열람 금지</label
			>
			<label
				><span>포인트 이름</span><input name="pointName" value={data.settings.pointName} /></label
			>
			<label
				><span>최고레벨</span><input
					name="maxLevel"
					type="number"
					min="1"
					value={data.settings.maxLevel}
				/></label
			>
		</section>
		<section class="admin-section point-event-grid">
			{#each data.pointEvents as event (event.key)}
				<label>
					<span>{event.label}</span>
					<input name={event.key} type="number" value={data.settings.eventValues[event.key]} />
				</label>
			{/each}
		</section>
	</form>
</section>

<style>
	.point-form {
		display: grid;
		gap: 1rem;
	}

	.point-settings input:not([type='checkbox']) {
		width: min(100%, 12rem);
	}

	.point-event-grid input {
		width: 7rem;
	}

	.message {
		color: #175cd3;
	}

	@media (max-width: 768px) {
		.point-settings input:not([type='checkbox']),
		.point-event-grid input {
			width: 100%;
		}
	}
</style>
