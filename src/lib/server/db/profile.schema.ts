import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';

export const profiles = sqliteTable('profiles', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	nickname: text('nickname').notNull().unique(),
	role: text('role', { enum: ['admin', 'manager', 'user'] })
		.notNull()
		.default('user'),
	status: text('status', { enum: ['active', 'suspended', 'deleted'] })
		.notNull()
		.default('active'),
	points: integer('points').notNull().default(0),
	adminMemo: text('admin_memo').notNull().default(''),
	suspendedUntil: integer('suspended_until', { mode: 'timestamp_ms' }),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
});
