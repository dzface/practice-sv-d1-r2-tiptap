# 릴토끼 기반 구조 구현 계획

> **구현 담당 에이전트 필수 지침:** `superpowers:subagent-driven-development`(권장) 또는 `superpowers:executing-plans`를 사용해 작업을 하나씩 구현한다. 각 단계는 체크박스(`- [ ]`)로 진행 상태를 기록한다.

**목표:** 타입이 적용된 브랜드 설정, D1 카테고리 스키마와 초기 데이터, 카테고리 라우팅, 공통 `container → box → item` 화면 구조, 정책 페이지, 저장되는 다크 모드를 갖춘 첫 번째 실행 가능한 릴토끼를 만든다.

**구조:** 라우팅되는 게시판은 코드와 D1에서 모두 `category`로 통일한다. 서버 전용 카테고리 접근 코드는 `src/lib/server/categories`에 두고, 그룹화와 표시용 도우미는 프레임워크에 종속되지 않도록 `src/lib/categories`에 둔다. 최상위 레이아웃은 문서 메타데이터를 담당하고, `(app)` 레이아웃은 공개 사이트 공통 화면과 카테고리 내비게이션을 담당한다.

**기술 구성:** SvelteKit 2, Svelte 5 runes, TypeScript, Cloudflare Workers, D1, Drizzle ORM, Node 24 내장 테스트 실행기, 일반 CSS.

---

## 전체 구현 순서

승인된 설계는 각각 독립적으로 실행하고 검증할 수 있는 다섯 단계로 나눈다.

1. **현재 계획 — 기반 구조:** 카테고리, 내비게이션, 공통 화면, 정책 페이지, 테마.
2. **인증:** Google·GitHub 로그인, 프로필, `admin | manager | user`, 정지와 가입 후 24시간 제한.
3. **게시글과 파일:** 게시글 CRUD, Tipex 래퍼, HTML 정화, 비공개 R2 첨부파일.
4. **커뮤니티 규칙:** 중첩 댓글, 투표, 승격·워스트 이동, 포인트 장부와 레벨.
5. **운영과 회원 생명주기:** 관리 화면, 감사 기록, 회원 탈퇴와 콘텐츠 계정 연결 제거.

각 단계는 다음 단계로 넘어가기 전에 `npm test`, `npm run check`, `npm run lint`를 모두 통과해야 한다.

## 파일 구성

### 이번 단계에서 새로 만드는 파일

- `src/lib/config/site.config.ts` — 타입이 적용된 배포용 브랜드 설정.
- `src/lib/config/site.config.test.ts` — 필수 브랜드 값과 ISO 날짜 검증.
- `src/lib/server/db/category.schema.ts` — Drizzle 카테고리 테이블.
- `src/lib/categories/category.ts` — 공통 카테고리 타입과 그룹화 함수.
- `src/lib/categories/category.test.ts` — 그룹과 정렬 순서 테스트.
- `src/lib/server/categories/repository.ts` — D1 카테고리 조회.
- `src/lib/server/categories/require-category.ts` — 라우트용 안전한 카테고리 조회.
- `src/lib/server/categories/require-category.test.ts` — 카테고리 존재·미존재 동작 검증.
- `scripts/seed-categories.sql` — 항상 같은 결과를 만드는 초기 카테고리 데이터.
- `src/lib/components/layout/Header.svelte` — 사이트명과 테마 전환 버튼.
- `src/lib/components/layout/Nav.svelte` — 그룹별 카테고리 내비게이션.
- `src/lib/components/layout/Footer.svelte` — 정책 링크와 회사명.
- `src/lib/components/ui/ThemeToggle.svelte` — 접근성을 갖춘 다크 모드 버튼.
- `src/lib/theme/theme.ts` — 테마 상수와 저장값 해석.
- `src/lib/theme/theme.test.ts` — 테마 저장값 테스트.
- `src/lib/styles/global.css` — 최소 전역 변수와 `container → box → item` 공통 스타일.
- `src/routes/(app)/+layout.server.ts` — 카테고리 내비게이션 데이터 불러오기.
- `src/routes/(app)/+layout.svelte` — 공개 사이트 공통 화면.
- `src/routes/(app)/+page.svelte` — 초기 카테고리 목록.
- `src/routes/(app)/[category]/+page.server.ts` — 카테고리 주소 검증.
- `src/routes/(app)/[category]/+page.svelte` — 게시글이 없을 때의 카테고리 화면.
- `src/routes/(app)/policy/+page.svelte` — 커뮤니티 운영정책.
- `src/routes/(app)/privacy/+page.svelte` — 개인정보처리방침.
- `src/routes/(app)/terms/+page.svelte` — 이용약관.

### 이번 단계에서 수정하는 파일

- `package.json` — 테스트와 로컬 초기 데이터 명령 추가.
- `src/lib/server/db/schema.ts` — 예제 task 테이블을 제거하고 인증·카테고리 스키마 내보내기.
- `src/routes/+layout.svelte` — 문서 메타데이터와 전역 CSS만 담당하도록 변경.
- `src/routes/+page.svelte` — 공개 홈을 `(app)`으로 옮긴 뒤 제거.
- `src/app.html` — 한국어 문서 설정과 화면 표시 전 테마 적용.

## 작업 1: 테스트 실행 환경과 타입이 적용된 사이트 설정 추가

**파일:**

- 수정: `package.json`
- 생성: `src/lib/config/site.config.test.ts`
- 생성: `src/lib/config/site.config.ts`

- [ ] **1단계: Node 내장 테스트 명령 추가**

`package.json`에 다음 명령을 추가한다.

```json
"test": "node --test",
"test:watch": "node --test --watch"
```

- [ ] **2단계: 먼저 실패하는 사이트 설정 테스트 작성**

`src/lib/config/site.config.test.ts` 생성:

```ts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { siteConfig } from './site.config.ts';

describe('사이트 설정', () => {
	it('배포에 필요한 브랜드 값을 제공한다', () => {
		assert.equal(siteConfig.siteName, '릴토끼');
		assert.ok(siteConfig.companyName.length > 0);
		assert.match(siteConfig.reportEmail, /^[^@]+@[^@]+\.[^@]+$/);
		assert.match(siteConfig.termsEffectiveDate, /^\d{4}-\d{2}-\d{2}$/);
	});
});
```

- [ ] **3단계: 테스트가 예상대로 실패하는지 확인**

실행: `npm test`

예상 결과: `site.config.ts`가 없으므로 실패한다.

- [ ] **4단계: 타입이 적용된 사이트 설정 구현**

`src/lib/config/site.config.ts` 생성:

```ts
export type SiteConfig = Readonly<{
	siteName: string;
	companyName: string;
	reportEmail: string;
	termsEffectiveDate: `${number}-${number}-${number}`;
	description: string;
}>;

export const siteConfig = {
	siteName: '릴토끼',
	companyName: '릴토끼 운영팀',
	reportEmail: 'dzface031@gmail.com',
	termsEffectiveDate: '2026-07-05',
	description: '작고 단순한 토끼 커뮤니티'
} satisfies SiteConfig;
```

- [ ] **5단계: 테스트와 프로젝트 검사 실행**

실행:

```powershell
npm test
npm run check
```

예상 결과: 두 명령 모두 통과한다.

- [ ] **6단계: 커밋**

```powershell
git add package.json src/lib/config
git commit -m "test: add site configuration foundation"
```

## 작업 2: 카테고리와 재현 가능한 초기 데이터 정의

**파일:**

- 생성: `src/lib/categories/category.test.ts`
- 생성: `src/lib/categories/category.ts`
- 생성: `src/lib/server/db/category.schema.ts`
- 수정: `src/lib/server/db/schema.ts`
- 생성: `scripts/seed-categories.sql`
- 수정: `package.json`
- 수정: `drizzle.config.ts`
- 수정: `wrangler.jsonc`
- 생성: Drizzle Kit이 만드는 `drizzle/` 마이그레이션

- [ ] **1단계: 먼저 실패하는 카테고리 그룹 테스트 작성**

`src/lib/categories/category.test.ts` 생성:

```ts
import { describe, expect, it } from 'vitest';
import { groupCategories, type CategorySummary } from './category';

const categories: CategorySummary[] = [
	{
		id: 'cat_science',
		slug: 'science',
		name: '과학',
		group: '읽을거리',
		groupOrder: 4,
		sortOrder: 2
	},
	{ id: 'cat_lil', slug: 'lil', name: '릴토끼', group: '릴토끼', groupOrder: 2, sortOrder: 1 },
	{ id: 'cat_humor', slug: 'humor', name: '유머', group: '읽을거리', groupOrder: 4, sortOrder: 1 }
];

describe('groupCategories', () => {
	it('sorts groups and their children by configured order', () => {
		expect(groupCategories(categories)).toEqual([
			{ name: '릴토끼', categories: [categories[1]] },
			{ name: '읽을거리', categories: [categories[2], categories[0]] }
		]);
	});
});
```

- [ ] **2단계: 테스트가 예상대로 실패하는지 확인**

실행: `npm test -- src/lib/categories/category.test.ts`

예상 결과: `category.ts`가 없으므로 실패한다.

- [ ] **3단계: 카테고리 타입과 그룹화 함수 구현**

`src/lib/categories/category.ts` 생성:

```ts
export type CategorySummary = {
	id: string;
	slug: string;
	name: string;
	group: string;
	groupOrder: number;
	sortOrder: number;
};

export type CategoryGroup = {
	name: string;
	categories: CategorySummary[];
};

export function groupCategories(categories: CategorySummary[]): CategoryGroup[] {
	const groups = new Map<string, { order: number; entries: CategorySummary[] }>();

	for (const category of categories) {
		const group = groups.get(category.group) ?? { order: category.groupOrder, entries: [] };
		group.entries.push(category);
		groups.set(category.group, group);
	}

	return [...groups]
		.sort(([, a], [, b]) => a.order - b.order)
		.map(([name, group]) => ({
			name,
			categories: [...group.entries].sort((a, b) => a.sortOrder - b.sortOrder)
		}));
}
```

- [ ] **4단계: Drizzle 카테고리 스키마 추가**

`src/lib/server/db/category.schema.ts` 생성:

```ts
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable(
	'categories',
	{
		id: text('id').primaryKey(),
		slug: text('slug').notNull(),
		name: text('name').notNull(),
		group: text('navigation_group').notNull(),
		groupOrder: integer('group_order').notNull(),
		sortOrder: integer('sort_order').notNull(),
		movementKind: text('movement_kind', {
			enum: ['standard', 'promotion_source', 'promotion_target', 'worst_target']
		})
			.notNull()
			.default('standard'),
		positiveThreshold: integer('positive_threshold'),
		negativeThreshold: integer('negative_threshold'),
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
	},
	(table) => [uniqueIndex('categories_slug_unique').on(table.slug)]
);
```

`src/lib/server/db/schema.ts`를 다음 내용으로 교체:

```ts
export * from './auth.schema';
export * from './category.schema';
```

`drizzle.config.ts`에서 `schema` 옆에 출력 폴더를 추가한다.

```ts
export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
		token: process.env.CLOUDFLARE_D1_TOKEN!
	},
	verbose: true,
	strict: true
});
```

이 코드 위에 있는 기존 환경변수 검사는 유지한다. `wrangler.jsonc`의 기존 `DB` 항목에는 마이그레이션 폴더를 추가한다.

```jsonc
{
	"binding": "DB",
	"database_name": "liltokki-db",
	"database_id": "de3a573c-4b96-4da6-8cd1-c430f469eebd",
	"migrations_dir": "drizzle"
}
```

- [ ] **5단계: 재현 가능한 로컬 초기 데이터 SQL 추가**

`scripts/seed-categories.sql` 생성:

```sql
INSERT INTO categories
  (id, slug, name, navigation_group, group_order, sort_order, movement_kind, positive_threshold, negative_threshold, is_active)
VALUES
  ('cat_big', 'big', '빅토끼', '빅토끼', 1, 1, 'promotion_target', NULL, NULL, 1),
  ('cat_trend', 'trend', '빅토끼 인기글', '빅토끼', 1, 2, 'standard', NULL, NULL, 1),
  ('cat_lil', 'lil', '릴토끼', '릴토끼', 2, 1, 'promotion_source', 10, -10, 1),
  ('cat_worst', 'worst', '릴토끼 워스트', '릴토끼', 2, 2, 'worst_target', NULL, NULL, 1),
  ('cat_hotdeal', 'hotdeal', '핫딜', '핫딜', 3, 1, 'standard', NULL, NULL, 1),
  ('cat_science', 'science', '과학', '읽을거리', 4, 1, 'standard', NULL, NULL, 1),
  ('cat_humor', 'humor', '유머', '읽을거리', 4, 2, 'standard', NULL, NULL, 1),
  ('cat_horror', 'horror', '공포', '읽을거리', 4, 3, 'standard', NULL, NULL, 1),
  ('cat_history', 'history', '역사', '읽을거리', 4, 4, 'standard', NULL, NULL, 1),
  ('cat_news', 'news', '사회', '읽을거리', 4, 5, 'standard', NULL, NULL, 1),
  ('cat_others', 'others', '기타', '읽을거리', 4, 6, 'standard', NULL, NULL, 1),
  ('cat_stock', 'stock', '주식 / 재테크', '토끼굴', 5, 1, 'standard', NULL, NULL, 1),
  ('cat_coin', 'coin', '코인', '토끼굴', 5, 2, 'standard', NULL, NULL, 1),
  ('cat_anonym', 'anonym', '익명', '토끼굴', 5, 3, 'standard', NULL, NULL, 1),
  ('cat_consultation', 'consultation', '고민상담', '토끼굴', 5, 4, 'standard', NULL, NULL, 1),
  ('cat_it', 'it', 'IT', '토끼굴', 5, 5, 'standard', NULL, NULL, 1),
  ('cat_sports', 'sports', '스포츠', '토끼굴', 5, 6, 'standard', NULL, NULL, 1),
  ('cat_cook', 'cook', '요리', '토끼굴', 5, 7, 'standard', NULL, NULL, 1),
  ('cat_creation', 'creation', '창작', '토끼굴', 5, 8, 'standard', NULL, NULL, 1),
  ('cat_notice', 'notice', '공지사항', '운영관리', 6, 1, 'standard', NULL, NULL, 1),
  ('cat_suggest', 'suggest', '건의하기', '운영관리', 6, 2, 'standard', NULL, NULL, 1)
ON CONFLICT(id) DO UPDATE SET
  slug = excluded.slug,
  name = excluded.name,
  navigation_group = excluded.navigation_group,
  group_order = excluded.group_order,
  sort_order = excluded.sort_order,
  movement_kind = excluded.movement_kind,
  positive_threshold = excluded.positive_threshold,
  negative_threshold = excluded.negative_threshold,
  is_active = excluded.is_active;
```

`package.json`에 다음 명령 추가:

```json
"db:seed:local": "wrangler d1 execute liltokki-db --local --file=./scripts/seed-categories.sql"
```

- [ ] **6단계: 로컬 마이그레이션 생성 및 적용**

실행:

```powershell
npm run db:generate
npx wrangler d1 migrations apply liltokki-db --local
npm run db:seed:local
```

예상 결과: 마이그레이션 하나가 `categories` 테이블을 만들고, 초기 데이터 명령은 21개 행을 추가하거나 갱신했다고 표시한다.

- [ ] **7단계: 테스트와 검사 실행**

실행:

```powershell
npm test -- src/lib/categories/category.test.ts
npm run check
```

예상 결과: 두 명령 모두 통과한다.

- [ ] **8단계: 커밋**

```powershell
git add package.json package-lock.json src/lib/categories src/lib/server/db scripts drizzle
git commit -m "feat: add category schema and seed data"
```

## 작업 3: 카테고리 저장소와 라우트 보호 함수 추가

**파일:**

- 생성: `src/lib/server/categories/repository.ts`
- 생성: `src/lib/server/categories/require-category.test.ts`
- 생성: `src/lib/server/categories/require-category.ts`

- [ ] **1단계: 먼저 실패하는 카테고리 보호 함수 테스트 작성**

`src/lib/server/categories/require-category.test.ts` 생성:

```ts
import { describe, expect, it, vi } from 'vitest';
import { requireCategory } from './require-category';

const lil = {
	id: 'cat_lil',
	slug: 'lil',
	name: '릴토끼',
	group: '릴토끼',
	groupOrder: 2,
	sortOrder: 1
};

describe('requireCategory', () => {
	it('returns an active category', async () => {
		const findBySlug = vi.fn().mockResolvedValue(lil);
		await expect(requireCategory('lil', findBySlug)).resolves.toEqual(lil);
	});

	it('throws a 404 response when the slug is unknown', async () => {
		const findBySlug = vi.fn().mockResolvedValue(undefined);
		await expect(requireCategory('missing', findBySlug)).rejects.toMatchObject({ status: 404 });
	});
});
```

- [ ] **2단계: 테스트가 예상대로 실패하는지 확인**

실행: `npm test -- src/lib/server/categories/require-category.test.ts`

예상 결과: `require-category.ts`가 없으므로 실패한다.

- [ ] **3단계: 라우트 보호 함수 구현**

`src/lib/server/categories/require-category.ts` 생성:

```ts
import { error } from '@sveltejs/kit';
import type { CategorySummary } from '$lib/categories/category';

type FindBySlug = (slug: string) => Promise<CategorySummary | undefined>;

export async function requireCategory(slug: string, findBySlug: FindBySlug) {
	const category = await findBySlug(slug);
	if (!category) error(404, '존재하지 않는 게시판입니다.');
	return category;
}
```

- [ ] **4단계: D1 조회 기능 구현**

`src/lib/server/categories/repository.ts` 생성:

```ts
import { and, asc, eq } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';

type Db = ReturnType<typeof getDb>;

const summary = {
	id: categories.id,
	slug: categories.slug,
	name: categories.name,
	group: categories.group,
	groupOrder: categories.groupOrder,
	sortOrder: categories.sortOrder
};

export function createCategoryRepository(db: Db) {
	return {
		listActive: () =>
			db
				.select(summary)
				.from(categories)
				.where(eq(categories.isActive, true))
				.orderBy(asc(categories.groupOrder), asc(categories.sortOrder)),

		findActiveBySlug: async (slug: string) => {
			const [category] = await db
				.select(summary)
				.from(categories)
				.where(and(eq(categories.slug, slug), eq(categories.isActive, true)))
				.limit(1);
			return category;
		}
	};
}
```

- [ ] **5단계: 테스트와 검사 실행**

실행:

```powershell
npm test -- src/lib/server/categories/require-category.test.ts
npm run check
```

예상 결과: 두 명령 모두 통과한다.

- [ ] **6단계: 커밋**

```powershell
git add src/lib/server/categories
git commit -m "feat: add category repository and route guard"
```

## 작업 4: 공통 사이트 화면과 카테고리 라우트 구성

**파일:**

- 생성: `src/lib/components/layout/Header.svelte`
- 생성: `src/lib/components/layout/Nav.svelte`
- 생성: `src/lib/components/layout/Footer.svelte`
- 생성: `src/lib/styles/global.css`
- 수정: `src/routes/+layout.svelte`
- 생성: `src/routes/(app)/+layout.server.ts`
- 생성: `src/routes/(app)/+layout.svelte`
- 생성: `src/routes/(app)/+page.svelte`
- 삭제: `src/routes/+page.svelte`
- 생성: `src/routes/(app)/[category]/+page.server.ts`
- 생성: `src/routes/(app)/[category]/+page.svelte`

- [ ] **1단계: 최소 전역 스타일 추가**

`src/lib/styles/global.css` 생성:

```css
:root {
	font-family: system-ui, sans-serif;
	color: #181818;
	background: #ffffff;
	color-scheme: light;
}

:root[data-theme='dark'] {
	color: #eeeeee;
	background: #151515;
	color-scheme: dark;
}

* {
	box-sizing: border-box;
}
body {
	margin: 0;
	background: inherit;
	color: inherit;
}
a {
	color: inherit;
}
button,
input,
textarea {
	font: inherit;
}
.container {
	width: min(100% - 2rem, 70rem);
	margin-inline: auto;
}
.box {
	padding-block: 1rem;
	border-bottom: 1px solid color-mix(in srgb, currentColor 18%, transparent);
}
.item {
	padding-block: 0.5rem;
}
.site-main {
	min-height: 65vh;
}
.muted {
	opacity: 0.7;
}
```

- [ ] **2단계: 최상위 레이아웃은 문서 설정만 담당하도록 변경**

`src/routes/+layout.svelte`를 다음 내용으로 교체:

```svelte
<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { siteConfig } from '$lib/config/site.config';
	import '$lib/styles/global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{siteConfig.siteName}</title>
	<meta name="description" content={siteConfig.description} />
</svelte:head>

{@render children()}
```

- [ ] **3단계: 내비게이션 컴포넌트 생성**

`src/lib/components/layout/Nav.svelte` 생성:

```svelte
<script lang="ts">
	import type { CategoryGroup } from '$lib/categories/category';
	let { groups }: { groups: CategoryGroup[] } = $props();
</script>

<nav aria-label="게시판">
	{#each groups as group}
		<section class="item" aria-labelledby={`nav-${group.name}`}>
			<strong id={`nav-${group.name}`}>{group.name}</strong>
			{#each group.categories as category}
				<a href={`/${category.slug}`}>{category.name}</a>
			{/each}
		</section>
	{/each}
</nav>

<style>
	section {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	strong {
		min-width: 7rem;
	}
</style>
```

`src/lib/components/layout/Header.svelte` 생성:

```svelte
<script lang="ts">
	import { siteConfig } from '$lib/config/site.config';
</script>

<header class="container box">
	<a href="/"><strong>{siteConfig.siteName}</strong></a>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
</style>
```

`src/lib/components/layout/Footer.svelte` 생성:

```svelte
<script lang="ts">
	import { siteConfig } from '$lib/config/site.config';
</script>

<footer class="container box">
	<nav aria-label="정책">
		<a href="/policy">운영정책</a>
		<a href="/privacy">개인정보처리방침</a>
		<a href="/terms">이용약관</a>
	</nav>
	<small class="muted">© {new Date().getFullYear()} {siteConfig.companyName}</small>
</footer>

<style>
	footer,
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	footer {
		justify-content: space-between;
	}
</style>
```

- [ ] **4단계: 카테고리 내비게이션을 한 번 불러와 표시**

`src/routes/(app)/+layout.server.ts` 생성:

```ts
import { getDb } from '$lib/server/db';
import { createCategoryRepository } from '$lib/server/categories/repository';
import { groupCategories } from '$lib/categories/category';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
	const categories = await createCategoryRepository(getDb(platform.env.DB)).listActive();
	return { categoryGroups: groupCategories(categories) };
};
```

`src/routes/(app)/+layout.svelte` 생성:

```svelte
<script lang="ts">
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Nav from '$lib/components/layout/Nav.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Header />
<div class="container box"><Nav groups={data.categoryGroups} /></div>
<main class="container site-main">{@render children()}</main>
<Footer />
```

- [ ] **5단계: 홈 페이지를 `(app)` 그룹으로 이동**

`src/routes/+page.svelte`를 삭제하고 `src/routes/(app)/+page.svelte` 생성:

```svelte
<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<h1>게시판</h1>
{#each data.categoryGroups as group}
	<section class="box">
		<h2>{group.name}</h2>
		{#each group.categories as category}
			<div class="item"><a href={`/${category.slug}`}>{category.name}</a></div>
		{/each}
	</section>
{/each}
```

- [ ] **6단계: 동적 카테고리 페이지 추가**

`src/routes/(app)/[category]/+page.server.ts` 생성:

```ts
import { getDb } from '$lib/server/db';
import { createCategoryRepository } from '$lib/server/categories/repository';
import { requireCategory } from '$lib/server/categories/require-category';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) throw new Error('D1 binding "DB" not found');
	const repository = createCategoryRepository(getDb(platform.env.DB));
	return { category: await requireCategory(params.category, repository.findActiveBySlug) };
};
```

`src/routes/(app)/[category]/+page.svelte` 생성:

```svelte
<script lang="ts">
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.category.name} · 릴토끼</title></svelte:head>
<h1>{data.category.name}</h1>
<p class="muted">아직 등록된 게시글이 없습니다.</p>
```

- [ ] **7단계: 공통 사이트 화면 검증**

실행:

```powershell
npm test
npm run check
npm run lint
```

예상 결과: 모든 명령이 통과한다. `npm run dev`를 실행해 `/`, `/lil`, 존재하지 않는 주소를 확인하고, 존재하지 않는 주소에는 404가 표시되어야 한다.

- [ ] **8단계: 커밋**

```powershell
git add src/lib/components src/lib/styles src/routes
git commit -m "feat: add category-aware app shell"
```

## 작업 5: 화면 깜빡임 없이 저장되는 다크 모드 추가

**파일:**

- 생성: `src/lib/theme/theme.test.ts`
- 생성: `src/lib/theme/theme.ts`
- 생성: `src/lib/components/ui/ThemeToggle.svelte`
- 수정: `src/lib/components/layout/Header.svelte`
- 수정: `src/app.html`

- [ ] **1단계: 먼저 실패하는 테마 저장값 테스트 작성**

`src/lib/theme/theme.test.ts` 생성:

```ts
import { describe, expect, it } from 'vitest';
import { parseStoredTheme } from './theme';

describe('parseStoredTheme', () => {
	it('accepts supported themes', () => {
		expect(parseStoredTheme('light')).toBe('light');
		expect(parseStoredTheme('dark')).toBe('dark');
	});

	it('rejects missing and unknown values', () => {
		expect(parseStoredTheme(null)).toBeUndefined();
		expect(parseStoredTheme('sepia')).toBeUndefined();
	});
});
```

- [ ] **2단계: 테스트가 예상대로 실패하는지 확인**

실행: `npm test -- src/lib/theme/theme.test.ts`

예상 결과: `theme.ts`가 없으므로 실패한다.

- [ ] **3단계: 테마 저장값 해석 기능 구현**

`src/lib/theme/theme.ts` 생성:

```ts
export const THEME_STORAGE_KEY = 'liltokki-theme';
export type Theme = 'light' | 'dark';

export function parseStoredTheme(value: string | null): Theme | undefined {
	return value === 'light' || value === 'dark' ? value : undefined;
}
```

- [ ] **4단계: 접근성을 갖춘 테마 전환 버튼 추가**

`src/lib/components/ui/ThemeToggle.svelte` 생성:

```svelte
<script lang="ts">
	import { THEME_STORAGE_KEY, type Theme } from '$lib/theme/theme';

	let theme = $state<Theme>('light');

	$effect(() => {
		theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
	});

	function toggle() {
		theme = theme === 'dark' ? 'light' : 'dark';
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem(THEME_STORAGE_KEY, theme);
		} catch {
			// The selected theme still applies for this page when storage is unavailable.
		}
	}
</script>

<button type="button" onclick={toggle} aria-label="색상 모드 변경">
	{theme === 'dark' ? '밝게' : '어둡게'}
</button>
```

`src/lib/components/layout/Header.svelte`를 다음 내용으로 교체:

```svelte
<script lang="ts">
	import { siteConfig } from '$lib/config/site.config';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
</script>

<header class="container box">
	<a href="/"><strong>{siteConfig.siteName}</strong></a>
	<ThemeToggle />
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
</style>
```

- [ ] **5단계: Svelte 화면 표시 전에 저장된 테마 적용**

`src/app.html`에서 `<html lang="en">`을 `<html lang="ko">`로 바꾸고, 다음 스크립트를 `<head>`의 첫 번째 항목으로 추가한다.

```html
<script>
	try {
		const saved = localStorage.getItem('liltokki-theme');
		const theme =
			saved === 'light' || saved === 'dark'
				? saved
				: matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light';
		document.documentElement.dataset.theme = theme;
	} catch {
		document.documentElement.dataset.theme = 'light';
	}
</script>
```

- [ ] **6단계: 테스트와 화면 검증 실행**

실행:

```powershell
npm test -- src/lib/theme/theme.test.ts
npm run check
npm run lint
```

예상 결과: 모든 명령이 통과한다. 밝은 모드와 어두운 모드에서 각각 새로고침해 반대 색상이 잠깐 나타나지 않는지 확인한다.

- [ ] **7단계: 커밋**

```powershell
git add src/app.html src/lib/theme src/lib/components/ui src/lib/components/layout/Header.svelte
git commit -m "feat: add persistent dark mode"
```

## 작업 6: 운영정책·개인정보처리방침·이용약관 페이지 추가

**파일:**

- 생성: `src/routes/(app)/policy/+page.svelte`
- 생성: `src/routes/(app)/privacy/+page.svelte`
- 생성: `src/routes/(app)/terms/+page.svelte`

- [ ] **1단계: 커뮤니티 운영정책 페이지 추가**

`src/routes/(app)/policy/+page.svelte`를 다음 내용으로 생성:

```svelte
<svelte:head><title>운영정책 · 릴토끼</title></svelte:head>
<h1>운영정책</h1>
<section class="box">
	<h2>게시물</h2>
	<p>
		회원은 자신이 작성한 게시글과 댓글에 책임을 집니다. 권리침해·개인정보 노출·불법 콘텐츠는 숨김
		또는 삭제될 수 있습니다.
	</p>
</section>
<section class="box">
	<h2>추천과 이동</h2>
	<p>
		릴토끼 게시글은 순추천 점수가 기준에 도달하면 빅토끼 또는 릴토끼 워스트로 영구 이동하며 작성자의
		수정·삭제가 잠깁니다.
	</p>
</section>
<section class="box">
	<h2>포인트</h2>
	<p>
		포인트는 활동 기록이며 첫 출시에서는 현금 환급, 양도 또는 외부 결제에 사용할 수 없습니다. 부정
		적립은 취소될 수 있습니다.
	</p>
</section>
<section class="box">
	<h2>제재와 신고</h2>
	<p>
		관리자는 운영정책 위반 콘텐츠를 숨기거나 삭제할 수 있고, 운영자는 회원을 기간 또는 영구 정지할
		수 있습니다.
	</p>
</section>
```

- [ ] **2단계: 개인정보처리방침 페이지 추가**

`src/routes/(app)/privacy/+page.svelte` 생성:

```svelte
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
	개인정보 또는 권리침해 삭제 요청: <a href={`mailto:${siteConfig.reportEmail}`}
		>{siteConfig.reportEmail}</a
	>
</p>
```

- [ ] **3단계: 이용약관 페이지 추가**

`src/routes/(app)/terms/+page.svelte` 생성:

```svelte
<script lang="ts">
	import { siteConfig } from '$lib/config/site.config';
</script>

<svelte:head><title>이용약관 · 릴토끼</title></svelte:head>
<h1>이용약관</h1>
<p>시행일: {siteConfig.termsEffectiveDate}</p>
<p>회원은 관련 법령과 운영정책을 지켜 서비스를 이용해야 합니다.</p>
<p>탈퇴 전에 자신의 게시물을 삭제할 수 있으며, 탈퇴 후 남은 포인트는 소멸합니다.</p>
```

- [ ] **4단계: 모든 공개 라우트 검증**

실행:

```powershell
npm test
npm run check
npm run lint
npm run build
```

예상 결과: 모든 명령이 통과한다. `/policy`, `/privacy`, `/terms`가 공통 사이트 화면 안에서 표시되는지 확인한다.

- [ ] **5단계: 커밋**

```powershell
git add src/routes/\(app\)/policy src/routes/\(app\)/privacy src/routes/\(app\)/terms
git commit -m "feat: add public policy pages"
```

## 작업 7: 기반 단계 최종 검증

**파일:**

- 아래 명령에서 발견된 실패를 고치는 데 필요한 파일만 수정한다.

- [ ] **1단계: 전체 자동 검사 실행**

실행:

```powershell
npm test
npm run check
npm run lint
npm run build
```

예상 결과: 테스트·타입·린트·빌드 오류 없이 모든 명령이 성공한다.

- [ ] **2단계: 로컬 D1 상태 검증**

실행:

```powershell
npx wrangler d1 execute liltokki-db --local --command="SELECT COUNT(*) AS count FROM categories"
```

예상 결과: `count` 값이 `21`이다.

- [ ] **3단계: 브라우저 동작 검증**

`npm run dev`를 실행하고 다음을 확인한다.

1. `/`에 그룹별 내비게이션과 카테고리 링크가 표시된다.
2. `/lil`에 게시글이 없는 릴토끼 화면이 표시된다.
3. `/does-not-exist`에 한국어 404 안내가 표시된다.
4. 테마 선택이 새로고침 후에도 유지되고 반대 색상이 잠깐 나타나지 않는다.
5. 푸터에서 `/policy`, `/privacy`, `/terms`로 이동할 수 있다.
6. 좁은 화면에서 내비게이션이 가로 스크롤 없이 줄바꿈된다.

- [ ] **4단계: 검증 과정에서 발생한 수정사항 커밋**

```powershell
git add package.json package-lock.json vitest.config.ts scripts drizzle src
git commit -m "chore: verify liltokki foundation"
```

검증 중 변경된 파일이 없다면 빈 커밋을 만들지 않는다.
