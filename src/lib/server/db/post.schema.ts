import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';
import { categories } from './category.schema';

export const posts = sqliteTable(
	'posts',
	{
		id: text('id').primaryKey(),
		categoryId: text('category_id')
			.notNull()
			.references(() => categories.id, { onUpdate: 'cascade' }),
		originalCategoryId: text('original_category_id')
			.notNull()
			.references(() => categories.id, { onUpdate: 'cascade' }),
		authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),
		authorName: text('author_name').notNull(),
		title: text('title').notNull(),
		body: text('body').notNull(),
		viewCount: integer('view_count').notNull().default(0),
		upvoteCount: integer('upvote_count').notNull().default(0),
		downvoteCount: integer('downvote_count').notNull().default(0),
		status: text('status', { enum: ['draft', 'public', 'hidden', 'deleted'] })
			.notNull()
			.default('public'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
	},
	(table) => [
		index('posts_category_status_created_idx').on(table.categoryId, table.status, table.createdAt)
	]
);
