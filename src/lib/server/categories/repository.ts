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
	sortOrder: categories.sortOrder,
	movementKind: categories.movementKind
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
