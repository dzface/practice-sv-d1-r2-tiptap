<script lang="ts">
	import { resolve } from '$app/paths';
	import Policy from '$lib/components/layout/Policy.svelte';
	import Privacy from '$lib/components/layout/Privacy.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let policyAgreed = $state(false);
	let privacyAgreed = $state(false);
	let nickname = $state('');
	let nicknameMessage = $state('');
	let nicknameAvailable = $state(false);
	let checkId = 0;

	const canSubmit = $derived(policyAgreed && privacyAgreed && nicknameAvailable);

	$effect(() => {
		if (form?.nickname && !nickname) nickname = form.nickname;
	});

	function resetNicknameCheck() {
		nicknameAvailable = false;
		nicknameMessage = '';
	}

	async function checkNickname() {
		const current = nickname.trim();
		const id = ++checkId;

		nicknameAvailable = false;
		if (current.length < 2) {
			nicknameMessage = '닉네임은 2자 이상 입력해 주세요.';
			return;
		}

		const response = await fetch(`/signup/check-nickname?nickname=${encodeURIComponent(current)}`);
		const result = (await response.json()) as { ok: boolean; message: string };
		if (id !== checkId) return;

		nicknameAvailable = result.ok;
		nicknameMessage = result.message;
	}
</script>

<svelte:head><title>회원가입 · 릴토끼</title></svelte:head>

<main class="signup-page">
	<section class="signup-box">
		<h1>회원가입</h1>
		<form method="post">
			<div class="agreement">
				<div class="policy-scroll">
					<Policy />
				</div>
				<label class="checkbox-label">
					<input type="checkbox" name="policy" bind:checked={policyAgreed} /> 운영정책에 동의합니다.
				</label>
			</div>

			<div class="agreement">
				<div class="policy-scroll">
					<Privacy />
				</div>
				<label class="checkbox-label">
					<input type="checkbox" name="privacy" bind:checked={privacyAgreed} /> 개인정보처리방침에 동의합니다.
				</label>
			</div>

			<label>
				닉네임
				<span class="nickname-row">
					<input
						name="nickname"
						bind:value={nickname}
						minlength="2"
						maxlength="16"
						pattern="[가-힣A-Za-z0-9_]+"
						required
						autocomplete="nickname"
						oninput={resetNicknameCheck}
					/>
					<button type="button" onclick={checkNickname} disabled={nickname.trim().length < 2}>
						중복확인
					</button>
				</span>
			</label>
			{#if nicknameMessage}
				<p class:ok={nicknameAvailable} class="message">{nicknameMessage}</p>
			{/if}
			{#if form?.message}<p class="error">{form.message}</p>{/if}

			<button type="submit" disabled={!canSubmit}>회원가입</button>
		</form>
		<p class="muted"><a href={resolve('/(auth)/login')}>로그인으로 돌아가기</a></p>
	</section>
</main>

<style>
	.signup-page {
		padding-block: 3rem;
	}

	.signup-box {
		width: min(100%, 44rem);
		margin-inline: auto;
	}

	form,
	label,
	.agreement {
		display: grid;
		gap: 0.75rem;
	}

	form {
		gap: 1.25rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.policy-scroll {
		max-height: 16rem;
		overflow: auto;
		border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
		padding: 1rem;
	}

	input:not([type='checkbox']) {
		width: 100%;
		font: inherit;
		padding: 0.65rem 0.75rem;
	}

	.nickname-row {
		display: flex;
		gap: 0.5rem;
	}

	button {
		padding: 0.7rem;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.message,
	.error {
		margin: 0;
		color: #b42318;
	}

	.message.ok {
		color: #157347;
	}
</style>
