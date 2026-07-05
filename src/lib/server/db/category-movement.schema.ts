import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { categories } from './category.schema';

export const categoryMovementRules = sqliteTable(
	'category_movement_rules',
	{
		id: text('id').primaryKey(),
		sourceCategoryId: text('source_category_id')
			.notNull()
			.references(() => categories.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		targetCategoryId: text('target_category_id')
			.notNull()
			.references(() => categories.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
		direction: text('direction', { enum: ['gte', 'lte'] }).notNull(),
		scoreThreshold: integer('score_threshold').notNull(),
		pointDelta: integer('point_delta').notNull(),
		isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
	},
	(table) => [
		uniqueIndex('category_movement_rules_source_direction_unique').on(
			table.sourceCategoryId,
			table.direction
		)
	]
);
