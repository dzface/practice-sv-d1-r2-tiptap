import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';

export const adminAuditLogs = sqliteTable(
	'admin_audit_logs',
	{
		id: text('id').primaryKey(),
		actorUserId: text('actor_user_id').references(() => user.id, { onDelete: 'set null' }),
		action: text('action', { enum: ['hide', 'restore', 'delete', 'role_change', 'user_update'] }).notNull(),
		targetType: text('target_type', { enum: ['post', 'comment', 'user'] }).notNull(),
		targetId: text('target_id').notNull(),
		reason: text('reason').notNull().default(''),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.notNull()
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
	},
	(table) => [
		index('admin_audit_logs_target_idx').on(table.targetType, table.targetId, table.createdAt),
		index('admin_audit_logs_actor_created_idx').on(table.actorUserId, table.createdAt)
	]
);

