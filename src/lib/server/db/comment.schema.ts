import { sql } from 'drizzle-orm';
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
	type AnySQLiteColumn
} from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';
import { posts } from './post.schema';

export const comments = sqliteTable(
	'comments',
	{
		id: text('id').primaryKey(),
		postId: text('post_id')
			.notNull()
			.references(() => posts.id, { onDelete: 'cascade' }),
		authorId: text('author_id').references(() => user.id, { onDelete: 'set null' }),
		authorName: text('author_name').notNull(),
		parentCommentId: text('parent_comment_id').references((): AnySQLiteColumn => comments.id, {
			onDelete: 'set null'
		}),
		body: text('body').notNull(),
		upvoteCount: integer('upvote_count').notNull().default(0),
		downvoteCount: integer('downvote_count').notNull().default(0),
		status: text('status', { enum: ['public', 'hidden', 'deleted'] })
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
		index('comments_post_status_created_idx').on(table.postId, table.status, table.createdAt),
		index('comments_parent_created_idx').on(table.parentCommentId, table.createdAt)
	]
);

export const commentVotes = sqliteTable(
	'comment_votes',
	{
		id: text('id').primaryKey(),
		commentId: text('comment_id')
			.notNull()
			.references(() => comments.id, { onDelete: 'cascade' }),
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
	(table) => [uniqueIndex('comment_votes_comment_user_unique').on(table.commentId, table.userId)]
);
