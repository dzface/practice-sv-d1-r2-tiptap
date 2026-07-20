import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
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
		anonymousName: text('anonymous_name'),
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

export const postVotes = sqliteTable(
	'post_votes',
	{
		id: text('id').primaryKey(),
		postId: text('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		value: integer('value').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
	},
	(table) => [uniqueIndex('post_votes_post_user_unique').on(table.postId, table.userId)]
);

export const postAttachments = sqliteTable(
	'post_attachments',
	{
		id: text('id').primaryKey(),
		postId: text('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		r2Key: text('r2_key').notNull(),
		fileName: text('file_name').notNull(),
		mimeType: text('mime_type').notNull(),
		size: integer('size').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
	},
	(table) => [
		index('post_attachments_post_created_idx').on(table.postId, table.createdAt),
		uniqueIndex('post_attachments_r2_key_unique').on(table.r2Key)
	]
);
