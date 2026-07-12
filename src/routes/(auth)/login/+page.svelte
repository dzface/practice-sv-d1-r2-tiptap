<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>로그인 · 릴토끼</title></svelte:head>

<main class="auth-page">
	<section class="auth-box">
		<h1>로그인</h1>
		{#if data.googleEnabled}
			<form method="post" action="?/google"><button type="submit">Google로 로그인</button></form>
		{/if}
		{#if data.githubEnabled}
			<form method="post" action="?/github"><button type="submit">GitHub로 로그인</button></form>
		{/if}
		{#if !data.googleEnabled && !data.githubEnabled}
			<p class="muted">소셜 로그인 설정 전입니다.</p>
		{/if}
		{#if form?.message}<p class="form-error" role="alert">{form.message}</p>{/if}
		<!-- <p class="muted"><a href={resolve('/(auth)/signup')}>회원가입</a></p> -->
	</section>
</main>

<style>
	.auth-page {
		height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.auth-box {
		width: min(100%, 26rem);
		margin-inline: auto;
	}
	form {
		margin-block: 1rem;
	}
	button {
		width: 100%;
		padding: 0.7rem;
	}
	.form-error {
		color: #c62828;
	}
</style>
