<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>회원가입 · 릴토끼</title></svelte:head>

<main class="auth-page container">
	<section class="auth-box">
		<h1>회원가입</h1>
		<form method="post" use:enhance>
			<label>
				이름
				<input name="name" autocomplete="name" required />
			</label>
			<label>
				이메일
				<input type="email" name="email" autocomplete="email" required />
			</label>
			<label>
				비밀번호
				<input type="password" name="password" autocomplete="new-password" minlength="8" required />
			</label>
			<button type="submit">회원가입</button>
		</form>
		{#if form?.message}<p class="form-error" role="alert">{form.message}</p>{/if}
		<p>이미 계정이 있나요? <a href={resolve('/(auth)/login')}>로그인</a></p>
	</section>
</main>

<style>
	.auth-page {
		padding-block: 3rem;
	}
	.auth-box {
		width: min(100%, 26rem);
		margin-inline: auto;
	}
	form,
	label {
		display: grid;
		gap: 0.5rem;
	}
	form {
		gap: 1rem;
	}
	input,
	button {
		padding: 0.7rem;
	}
	.form-error {
		color: #c62828;
	}
</style>
