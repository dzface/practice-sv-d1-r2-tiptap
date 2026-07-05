# 홈 최신글과 인증 경로 수정 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모든 활성 게시판의 최신글 10행을 홈에 표시하고, 빅토끼 인기글 규칙과 실제 로그인·회원가입·로그아웃 경로를 바로잡는다.

**Architecture:** D1에는 게시글과 데이터 기반 게시판 이동 규칙을 추가한다. 홈 서버 로더는 활성 카테고리와 공개 게시글을 읽어 게시판별 최대 10개로 묶고, Svelte 컴포넌트는 빈 게시판도 고정 10행 높이로 렌더링한다. 인증 화면은 `(auth)` 라우트 그룹으로 분리하고 `(app)` 레이아웃이 세션 유무만 헤더에 전달한다.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, Drizzle ORM, Cloudflare D1, Better Auth, Vitest

---

## 파일 구조

- `src/lib/server/db/post.schema.ts`: 게시글 테이블과 홈 조회 인덱스
- `src/lib/server/db/category-movement.schema.ts`: 게시판 이동 규칙 테이블
- `src/lib/server/posts/home-posts.ts`: 게시판별 최신글을 묶는 순수 함수
- `src/lib/server/posts/repository.ts`: 홈 최신글 D1 조회
- `src/lib/components/post/HomeBoard.svelte`: 게시판 제목과 고정 10행 목록
- `src/routes/(app)/+page.server.ts`: 홈 데이터 조립
- `src/routes/(auth)/login/*`, `signup/*`, `logout/+server.ts`: 실제 인증 경로
- `src/lib/components/layout/Header.svelte`: 인증 상태별 버튼
- `drizzle/0001_home_posts_and_movement_rules.sql`: 기존 DB용 후속 마이그레이션

### 작업 1: 빅토끼 인기글 ID와 이동 규칙 데이터

**파일:**

- 수정: `src/lib/server/db/category.schema.ts`
- 생성: `src/lib/server/db/category-movement.schema.ts`
- 수정: `src/lib/server/db/schema.ts`
- 수정: `scripts/seed-categories.sql`
- 생성: `drizzle/0001_home_posts_and_movement_rules.sql`
- 테스트: `src/lib/server/categories/movement-rules.test.ts`

- [ ] 이동 규칙 시드 정의가 `lil → big(+10, +100)`, `lil → worst(-10, -30)`, `big → trend(+100, +1000)`을 정확히 나타내는 실패 테스트를 작성한다.
- [ ] `npm test -- src/lib/server/categories/movement-rules.test.ts`를 실행해 이동 규칙 모듈 부재로 실패하는지 확인한다.
- [ ] `category_movement_rules` 스키마와 타입 안전한 세 규칙 상수를 구현한다. 규칙에는 `id`, `sourceCategoryId`, `targetCategoryId`, `direction`, `scoreThreshold`, `pointDelta`, `isActive`를 둔다.
- [ ] 카테고리 시드의 빅토끼 인기글 내부 ID를 `cat_trend`에서 `trend`로 변경한다.
- [ ] 후속 SQL 마이그레이션에서 기존 `cat_trend` 행을 `trend`로 안전하게 이전하고 세 이동 규칙을 멱등성 있게 삽입한다.
- [ ] 대상 테스트를 다시 실행해 통과를 확인한다.

### 작업 2: 게시글 스키마와 홈 최신글 조회

**파일:**

- 생성: `src/lib/server/db/post.schema.ts`
- 수정: `src/lib/server/db/schema.ts`
- 수정: `drizzle/0001_home_posts_and_movement_rules.sql`
- 생성: `src/lib/server/posts/home-posts.ts`
- 생성: `src/lib/server/posts/home-posts.test.ts`
- 생성: `src/lib/server/posts/repository.ts`

- [ ] 11개 이상의 글에서 최신 10개만 남고, 게시글이 없는 카테고리도 빈 배열로 포함되는 실패 테스트를 작성한다.
- [ ] `npm test -- src/lib/server/posts/home-posts.test.ts`를 실행해 구현 부재로 실패하는지 확인한다.
- [ ] 홈에 필요한 `HomePost`와 `HomeBoard` 타입 및 `groupHomePosts(categories, posts, 10)` 순수 함수를 구현한다.
- [ ] `posts` 테이블에 `id`, `categoryId`, `originalCategoryId`, `authorId`, `authorName`, `title`, `body`, `viewCount`, `upvoteCount`, `downvoteCount`, `status`, `createdAt`, `updatedAt`을 정의하고 `(category_id, status, created_at)` 인덱스를 둔다.
- [ ] 저장소에서 활성 카테고리의 공개 글을 최신순으로 조회하고 순수 함수로 게시판별 10개를 묶는다.
- [ ] 대상 테스트를 다시 실행해 최신순·10개 제한·빈 게시판 포함을 확인한다.

### 작업 3: 홈 고정 10행 게시판 화면

**파일:**

- 생성: `src/routes/(app)/+page.server.ts`
- 수정: `src/routes/(app)/+page.svelte`
- 생성: `src/lib/components/post/HomeBoard.svelte`
- 수정: `src/lib/styles/global.css`

- [ ] 홈 서버 로더가 D1 저장소에서 `boards`를 반환하도록 구현한다.
- [ ] `HomeBoard.svelte`에서 게시판 제목과 실제 글만 렌더링하고, 목록 영역은 CSS 변수 기반으로 정확히 10행 높이를 확보한다.
- [ ] 홈 페이지를 반응형 격자로 바꿔 기본 1열, 충분한 화면에서는 동일 너비 2열로 표시한다.
- [ ] 글 제목은 `/${categorySlug}/${postId}`로 연결하고 조회수·순추천수를 표시한다.
- [ ] `npm run check`를 실행해 Svelte 타입과 접근성 오류가 없는지 확인한다.

### 작업 4: 인증 경로와 헤더 상태

**파일:**

- 생성: `src/routes/(auth)/login/+page.server.ts`
- 생성: `src/routes/(auth)/login/+page.svelte`
- 생성: `src/routes/(auth)/signup/+page.server.ts`
- 생성: `src/routes/(auth)/signup/+page.svelte`
- 생성: `src/routes/(auth)/logout/+server.ts`
- 수정: `src/routes/(app)/+layout.server.ts`
- 수정: `src/routes/(app)/+layout.svelte`
- 수정: `src/lib/components/layout/Header.svelte`
- 삭제: `src/routes/demo/better-auth/+page.server.ts`
- 삭제: `src/routes/demo/better-auth/+page.svelte`
- 삭제: `src/routes/demo/better-auth/login/+page.server.ts`
- 삭제: `src/routes/demo/better-auth/login/+page.svelte`

- [ ] 로그인 액션은 이메일·비밀번호로 Better Auth를 호출하고 성공 시 `/`, 실패 시 한국어 일반 오류를 반환하도록 구현한다.
- [ ] 회원가입 액션은 이름·이메일·비밀번호로 Better Auth를 호출하고 성공 시 `/`, 실패 시 한국어 일반 오류를 반환하도록 구현한다.
- [ ] 두 페이지 모두 이미 로그인했다면 `/`로 이동하고 서로의 화면으로 가는 링크를 제공한다.
- [ ] `/logout` POST 처리에서 Better Auth 로그아웃 후 `/`로 이동하도록 구현한다.
- [ ] `(app)` 레이아웃이 `user: { name } | null`을 반환하고 Header에 전달하게 한다.
- [ ] Header는 비로그인 상태에 `/login` 링크, 로그인 상태에 `/logout` POST 버튼을 표시한다.
- [ ] 데모 인증 파일을 삭제하고 남은 `/demo/better-auth` 참조가 없는지 `rg`로 확인한다.
- [ ] `npm run check`를 실행해 라우트 타입과 폼 액션 타입을 확인한다.

### 작업 5: 마이그레이션과 전체 회귀 검증

**파일:**

- 수정: `docs/superpowers/plans/2026-07-06-home-auth-correction-implementation.md`

- [ ] `npm run db:migrate:local`로 후속 마이그레이션을 로컬 D1에 적용한다.
- [ ] `npm run db:seed:local`로 카테고리를 갱신한다.
- [ ] 로컬 D1에서 `cat_trend`가 없고 `trend` 및 세 이동 규칙이 있는지 조회한다.
- [ ] `npm test`를 실행해 전체 단위 테스트가 통과하는지 확인한다.
- [ ] `npm run lint`와 `npm run check`를 실행한다.
- [ ] `npm run build`를 실행해 Cloudflare 프로덕션 빌드가 성공하는지 확인한다.
- [ ] 구현 계획의 완료 항목에 체크하고 사용자에게 변경 파일과 Cloudflare에서 적용할 마이그레이션 명령만 한국어로 전달한다.

> 사용자가 GitHub push를 직접 수행하므로 이 계획은 커밋·푸시를 실행하지 않는다.
