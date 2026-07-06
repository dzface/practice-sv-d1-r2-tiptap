# Profile Nickname Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 최초 소셜 로그인 사용자가 사이트 닉네임을 설정해야만 일반 페이지를 이용하게 한다.

**Architecture:** Better Auth의 `user`는 인증 계정 원본으로 두고, 사이트 전용 상태는 `profiles` 테이블에 저장한다. `(app)` 레이아웃 서버가 프로필 존재 여부를 확인해 `/profile/setup`으로 보낸다. 헤더는 프로필 닉네임을 표시한다.

**Tech Stack:** SvelteKit, Better Auth, Drizzle ORM, Cloudflare D1, Vitest.

---

### Task 1: Profile data model

**Files:**
- Create: `src/lib/server/db/profile.schema.ts`
- Modify: `src/lib/server/db/schema.ts`
- Create: `drizzle/0004_profiles.sql`

- [ ] Add `profiles` table with `user_id`, unique `nickname`, `role`, `status`, `points`, timestamps.
- [ ] Export schema from central DB schema.

### Task 2: Profile repository

**Files:**
- Create: `src/lib/server/profiles/nickname.ts`
- Create: `src/lib/server/profiles/repository.ts`
- Create: `src/lib/server/profiles/repository.test.ts`

- [ ] Test nickname normalization/validation.
- [ ] Test missing profile lookup.
- [ ] Test profile creation with duplicate nickname rejection.

### Task 3: Setup and profile routes

**Files:**
- Create: `src/routes/(app)/profile/setup/+page.server.ts`
- Create: `src/routes/(app)/profile/setup/+page.svelte`
- Create: `src/routes/(app)/profile/+page.server.ts`
- Create: `src/routes/(app)/profile/+page.svelte`
- Modify: `src/routes/(app)/+layout.server.ts`

- [ ] Redirect logged-in users without profile to `/profile/setup`.
- [ ] Save valid nickname, then redirect home.
- [ ] Show profile summary page.

### Task 4: Header profile button

**Files:**
- Modify: `src/lib/components/layout/Header.svelte`
- Modify: `src/routes/(app)/+layout.server.ts`

- [ ] Pass profile nickname to header.
- [ ] Show nickname profile link and logout button when logged in.
- [ ] Show setup link when logged in without nickname.

### Task 5: Verification

- [ ] Run `npm test`.
- [ ] Run `npx svelte-check --tsconfig ./tsconfig.json`.
- [ ] Run `npm run build`.
