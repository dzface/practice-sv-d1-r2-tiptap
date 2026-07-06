<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>닉네임 설정 · 릴토끼</title></svelte:head>

<section class="box setup">
	<h1>닉네임 설정</h1>
	<p class="muted">릴토끼에서 사용할 닉네임을 정해 주세요. 로그인 이름과 별개입니다.</p>
	<form method="post">
		<label>
			닉네임
			<input
				name="nickname"
				value={form?.nickname ?? ''}
				minlength="2"
				maxlength="16"
				pattern="[가-힣A-Za-z0-9_]+"
				required
				autocomplete="nickname"
			/>
		</label>
		{#if form?.message}<p class="error">{form.message}</p>{/if}
		<button type="submit">저장</button>
	</form>
</section>

<style>
	.setup {
		max-width: 36rem;
	}

	form,
	label {
		display: grid;
		gap: 0.75rem;
	}

	input {
		font: inherit;
		padding: 0.65rem 0.75rem;
	}

	.error {
		color: #b42318;
	}
</style>
