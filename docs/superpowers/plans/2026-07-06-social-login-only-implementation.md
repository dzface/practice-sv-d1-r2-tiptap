# Google·GitHub 로그인 전용 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이메일 인증 코드를 모두 제거하고 Google·GitHub OAuth 로그인만 제공한다.

**Architecture:** Better Auth에는 설정된 Google·GitHub 공급자만 등록한다. 로그인 페이지의 두 서버 액션이 각 공급자의 OAuth URL로 이동하며, 이메일 가입 라우트와 OTP 발송 기반은 코드와 D1에서 제거한다.

**Tech Stack:** SvelteKit 2, Better Auth 1.4, Cloudflare Workers/D1, Vitest

---

### 작업 1: 인증 설정과 로그인 화면

**파일:**

- 수정: `src/lib/server/auth.ts`
- 수정: `src/routes/(auth)/login/+page.server.ts`
- 수정: `src/routes/(auth)/login/+page.svelte`
- 수정: `.env.example`
- 수정: `wrangler.types.jsonc`

- [ ] Better Auth에서 이메일·비밀번호와 Email OTP 플러그인을 제거한다.
- [ ] Google과 GitHub 환경변수가 각각 모두 있을 때 해당 공급자를 활성화한다.
- [ ] 로그인 액션을 `google`, `github` 두 개로 제한하고 반환된 OAuth URL로 이동한다.
- [ ] 로그인 화면에서 설정된 공급자 버튼만 표시한다.
- [ ] 환경변수 예제와 Worker 타입 설정에서 Apps Script 값을 제거하고 GitHub 값을 추가한다.

### 작업 2: 이메일 가입과 Apps Script 제거

**파일:**

- 삭제: `src/routes/(auth)/signup/**`
- 삭제: `src/routes/(auth)/verify-email/**`
- 삭제: `src/lib/server/auth/email-policy*`
- 삭제: `src/lib/server/auth/apps-script-email*`
- 삭제: `src/lib/server/auth/otp-rate-limit*`
- 삭제: `src/lib/server/db/otp-rate-limit.schema.ts`
- 삭제: `apps-script/email-verification/**`
- 수정: `src/lib/server/db/schema.ts`
- 생성: `drizzle/0003_remove_otp_rate_limits.sql`

- [ ] 이메일 가입·OTP·Apps Script 파일과 참조를 삭제한다.
- [ ] 후속 마이그레이션에서 `otp_rate_limits` 테이블을 제거한다.
- [ ] `/signup`, `/verify-email` 라우트가 존재하지 않는지 확인한다.

### 작업 3: 검증

- [ ] 로컬 D1에 `0003_remove_otp_rate_limits.sql`을 적용한다.
- [ ] `npm test`, `npm run lint`, `npm run check`, `npm run build`를 실행한다.
- [ ] `/login`은 200, `/signup`과 `/verify-email`은 404인지 확인한다.
- [ ] Git 작업은 하지 않고 필요한 Google·GitHub 환경변수와 콜백 주소를 전달한다.

> 사용자가 GitHub push를 직접 수행하므로 커밋·푸시는 실행하지 않는다.
