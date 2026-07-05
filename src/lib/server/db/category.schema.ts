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
