CREATE TABLE `post_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`r2_key` text NOT NULL,
	`file_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `post_attachments_post_created_idx` ON `post_attachments` (`post_id`, `created_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `post_attachments_r2_key_unique` ON `post_attachments` (`r2_key`);
