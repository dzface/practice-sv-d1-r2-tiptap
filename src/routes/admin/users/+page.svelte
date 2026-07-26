<script lang="ts">
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let selectedUserIds = $state<string[]>([]);

	const searchFields = [
		{ value: 'id', label: '아이디' },
		{ value: 'email', label: '이메일' },
		{ value: 'name', label: '이름' },
		{ value: 'nickname', label: '닉네임' },
		{ value: 'phone', label: '전화번호' },
		{ value: 'createdAt', label: '가입일시' },
		{ value: 'createdAtFrom', label: '가입일시(이상)' },
		{ value: 'createdAtTo', label: '가입일시(이하)' },
		{ value: 'signupIp', label: '가입 IP 주소' },
		{ value: 'lastLoginAt', label: '최근 로그인 일시' },
		{ value: 'lastLoginAtFrom', label: '최근 로그인 일시(이상)' },
		{ value: 'lastLoginAtTo', label: '최근 로그인 일시(이하)' },
		{ value: 'lastLoginIp', label: '최근 로그인 IP 주소' },
		{ value: 'birth', label: '생일' },
		{ value: 'custom', label: '사용자 정의' },
		{ value: 'adminMemo', label: '관리자 메모' }
	];

	let visibleUserIds = $derived(data.users.map((user) => user.userId));
	let allSelected = $derived(
		visibleUserIds.length > 0 && visibleUserIds.every((userId) => selectedUserIds.includes(userId))
	);

	function toggleAll(checked: boolean) {
		selectedUserIds = checked ? visibleUserIds : [];
	}

	function toggleUser(userId: string, checked: boolean) {
		selectedUserIds = checked
			? [...new Set([...selectedUserIds, userId])]
			: selectedUserIds.filter((id) => id !== userId);
	}

	function statusLabel(status: string) {
		return status === 'active' ? '승인' : '차단';
	}
</script>

<section class="admin-page">
	<div class="page-header">
		<div>
			<h1>회원목록</h1>
			<p>회원 조회, 상태 확인, 권한 변경을 관리합니다.</p>
		</div>
	</div>

	{#if form?.message}<p class="error">{form.message}</p>{/if}

	<form method="GET" class="user-search" aria-label="회원 검색">
		<select name="field" aria-label="검색 조건">
			{#each searchFields as field (field.value)}
				<option value={field.value} selected={field.value === data.search.field}
					>{field.label}</option
				>
			{/each}
		</select>
		<input name="keyword" value={data.search.keyword} aria-label="검색어" />
		<button type="submit">검색</button>
	</form>

	<div class="bulk-actions" aria-label="회원 일괄 작업">
		<button type="button" disabled={selectedUserIds.length === 0}>수정</button>
		<button type="button" disabled={selectedUserIds.length === 0}>삭제</button>
	</div>

	<section class="admin-section" aria-label="회원 목록">
		<div class="user-table">
			<div class="user-row user-head">
				<span>번호</span><span>아이디</span><span>이메일주소</span><span>이름</span><span
					>닉네임</span
				><span>권한</span><span>상태</span><span>조회및수정</span><span>관리자메모</span><label
					><input
						type="checkbox"
						checked={allSelected}
						onchange={(event) => toggleAll(event.currentTarget.checked)}
					/> 선택</label
				>
			</div>
			{#each data.users as user, index (user.userId)}
				<div class="user-row">
					<span>{index + 1}</span>
					<code>{user.userId}</code>
					<span>{user.email ?? '-'}</span>
					<span>{user.name ?? '-'}</span>
					<strong>{user.nickname}</strong>
					<form method="POST" action="?/updateRole" class="role-form">
						<input type="hidden" name="userId" value={user.userId} />
						<select
							name="role"
							aria-label={`${user.nickname} 권한`}
							onchange={(event) => event.currentTarget.form?.requestSubmit()}
						>
							{#each data.roles as role (role)}
								<option value={role} selected={role === user.role}>{role}</option>
							{/each}
						</select>
					</form>
					<form method="POST" action="?/updateStatus" class="status-form">
						<input type="hidden" name="userId" value={user.userId} />
						<select
							name="status"
							aria-label={`${user.nickname} 상태`}
							onchange={(event) => event.currentTarget.form?.requestSubmit()}
						>
							{#each data.statuses as status (status)}
								<option value={status} selected={status === user.status}
									>{statusLabel(status)}</option
								>
							{/each}
						</select>
					</form>
					<a href={`/admin/users/${user.userId}`}>조회및수정</a>
					<span>{user.adminMemo || '-'}</span>
					<label
						><input
							type="checkbox"
							name="selected"
							value={user.userId}
							checked={selectedUserIds.includes(user.userId)}
							onchange={(event) => toggleUser(user.userId, event.currentTarget.checked)}
						/> 선택</label
					>
				</div>
			{:else}
				<p class="empty-row">회원이 없습니다.</p>
			{/each}
		</div>
		<div class="pagination-placeholder">1</div>
	</section>
</section>

<style>
	.user-search {
		display: grid;
		grid-template-columns: 12rem minmax(10rem, 1fr) auto;
		gap: 0.35rem;
		max-width: 36rem;
	}

	.user-search button {
		padding-inline: 1rem;
	}

	.bulk-actions {
		display: flex;
		gap: 0.5rem;
	}

	.user-table {
		overflow-x: auto;
	}

	.user-row {
		display: grid;
		grid-template-columns: 3rem 10rem 14rem 8rem 8rem 5.5rem 5.5rem 8rem 12rem 7rem;
		gap: 0.5rem;
		align-items: center;
		min-width: 85rem;
		border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
		padding-block: 0.55rem;
	}

	.user-row > * {
		min-width: 0;
	}

	.user-head {
		font-weight: 700;
	}

	.role-form select,
	.status-form select {
		width: 4.75rem;
	}

	code {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	@media (max-width: 768px) {
		.user-search {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
