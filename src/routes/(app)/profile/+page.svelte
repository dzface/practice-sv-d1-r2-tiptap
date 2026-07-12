<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>프로필 · 릴토끼</title></svelte:head>

<section class="box profile">
	<h1>프로필</h1>

	<dl>
		<div>
			<dt>닉네임</dt>
			<dd>{data.profile.nickname}</dd>
		</div>
		<div>
			<dt>역할</dt>
			<dd>{data.profile.role}</dd>
		</div>
		<div>
			<dt>포인트</dt>
			<dd>{data.profile.points}</dd>
		</div>
	</dl>
</section>

<section class="box profile">
	<h2>닉네임 수정</h2>
	<form method="post" action="?/updateNickname">
		<label>
			새 닉네임
			<input
				name="nickname"
				value={data.profile.nickname}
				minlength="2"
				maxlength="16"
				pattern="[가-힣A-Za-z0-9_]+"
				required
				autocomplete="nickname"
			/>
		</label>
		{#if form?.form === 'nickname'}<p class="message">{form.message}</p>{/if}
		<button type="submit">닉네임 저장</button>
	</form>
</section>

<section class="box profile danger">
	<h2>회원탈퇴</h2>
	<p class="muted">
		탈퇴 시 계정, 소셜 로그인 연결, 세션, 프로필은 삭제되며 남은 포인트는 소멸합니다. <br>
		기존 게시글은 작성 당시 닉네임으로 남습니다.
	</p>
	
	<form method="post" action="?/deleteAccount">
		<label>
			탈퇴하려면 아래에 "탈퇴"를 입력하세요.
			<input name="confirm" autocomplete="off" />
		</label>
		{#if form?.form === 'delete'}<p class="message">{form.message}</p>{/if}
		<button type="submit">회원탈퇴</button>
	</form>
</section>

<style>
	.profile {
		max-width: 42rem;
	}

	dl {
		display: grid;
		gap: 0.75rem;
	}

	dl div {
		display: flex;
		gap: 0.75rem;
	}

	dt {
		color: var(--muted);
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

	.danger button {
		color: #b42318;
	}

	.message {
		color: #175cd3;
	}
</style>
