CREATE TABLE `admin_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`reason` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `user`(`id`) ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `admin_audit_logs_target_idx`
ON `admin_audit_logs` (`target_type`, `target_id`, `created_at`);
--> statement-breakpoint
CREATE INDEX `admin_audit_logs_actor_created_idx`
ON `admin_audit_logs` (`actor_user_id`, `created_at`);
