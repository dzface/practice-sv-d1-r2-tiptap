<script lang="ts">
	import { siteConfig } from '$lib/config/site.config';
</script>

<svelte:head><title>개인정보처리방침 · 릴토끼</title></svelte:head>

<h1>개인정보처리방침</h1>
<p>릴토끼는 회원가입, 로그인, 보안과 서비스 운영에 필요한 정보만 처리합니다.</p>
<p>
	탈퇴 시 인증정보와 계정 연결은 삭제하며, 게시글과 댓글은 작성 당시 닉네임과 함께 남을 수 있습니다.
</p>
<p>
	개인정보 또는 권리침해 삭제 요청:
	<a href={`mailto:${siteConfig.reportEmail}`}>{siteConfig.reportEmail}</a>
</p>
