CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`author_id` text,
	`author_name` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'public' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `comments_post_status_created_idx`
ON `comments` (`post_id`, `status`, `created_at`);
