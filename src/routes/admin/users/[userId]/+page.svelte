<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	function statusLabel(status: string) {
		return status === 'active' ? '승인' : '차단';
	}

	function formatDateTimeLocal(value: Date | string | null) {
		if (!value) return '';
		const date = new Date(value);
		const offsetMs = date.getTimezoneOffset() * 60 * 1000;
		return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
	}
</script>

<section class="admin-page user-edit-page">
	<div class="page-header">
		<div>
			<h1>회원 조회 및 수정</h1>
			<p>{data.user.nickname} 회원 정보를 수정합니다.</p>
		</div>
		<a href="/admin/users">목록</a>
	</div>

	{#if form?.message}<p class="error">{form.message}</p>{/if}

	<form method="POST" class="user-edit-form">
		<label>
			<span>아이디</span>
			<input value={data.user.userId} disabled />
		</label>
		<label>
			<span>이메일</span>
			<input name="email" type="email" value={data.user.email ?? ''} required />
		</label>
		<label>
			<span>이름</span>
			<input name="name" value={data.user.name ?? ''} required />
		</label>
		<label>
			<span>닉네임</span>
			<input name="nickname" value={data.user.nickname} required />
		</label>
		<label>
			<span>비번</span>
			<input value="소셜 로그인 계정은 비밀번호를 관리하지 않습니다" disabled />
		</label>
		<label>
			<span>상태</span>
			<select name="status">
				{#each data.statuses as status (status)}
					<option value={status} selected={status === data.user.status}
						>{statusLabel(status)}</option
					>
				{/each}
			</select>
		</label>
		<label>
			<span>차단 종료일</span>
			<input
				name="suspendedUntil"
				type="datetime-local"
				value={formatDateTimeLocal(data.user.suspendedUntil)}
			/>
		</label>
		<label>
			<span>관리자메모</span>
			<textarea name="adminMemo" rows="6">{data.user.adminMemo}</textarea>
		</label>
		<button type="submit">저장</button>
	</form>
</section>

<style>
	.user-edit-form {
		display: grid;
		gap: 0.85rem;
		max-width: 42rem;
	}

	.user-edit-form label {
		display: grid;
		gap: 0.25rem;
	}

	.user-edit-form textarea {
		resize: vertical;
	}

	.user-edit-form button {
		justify-self: start;
		padding: 0.45rem 0.8rem;
	}
</style>
