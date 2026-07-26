import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const pointSettings = sqliteTable('point_settings', {
	id: text('id').primaryKey(),
	pointName: text('point_name').notNull().default('포인트'),
	maxLevel: integer('max_level').notNull().default(5),
	blockDownloadForUsers: integer('block_download_for_users', { mode: 'boolean' })
		.notNull()
		.default(false),
	blockReadForUsers: integer('block_read_for_users', { mode: 'boolean' }).notNull().default(false),
	eventValues: text('event_values', { mode: 'json' }).$type<Record<string, number>>().notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
});
