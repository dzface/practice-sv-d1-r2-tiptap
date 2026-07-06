UPDATE `categories`
SET `id` = 'trend'
WHERE `id` = 'cat_trend'
  AND NOT EXISTS (SELECT 1 FROM `categories` WHERE `id` = 'trend');
--> statement-breakpoint
DELETE FROM `categories` WHERE `id` = 'cat_trend';
--> statement-breakpoint
CREATE TABLE `category_movement_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`source_category_id` text NOT NULL,
	`target_category_id` text NOT NULL,
	`direction` text NOT NULL,
	`score_threshold` integer NOT NULL,
	`point_delta` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`source_category_id`) REFERENCES `categories`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`target_category_id`) REFERENCES `categories`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_movement_rules_source_direction_unique`
ON `category_movement_rules` (`source_category_id`, `direction`);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`original_category_id` text NOT NULL,
	`author_id` text,
	`author_name` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`upvote_count` integer DEFAULT 0 NOT NULL,
	`downvote_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'public' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE cascade,
	FOREIGN KEY (`original_category_id`) REFERENCES `categories`(`id`) ON UPDATE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `posts_category_status_created_idx`
ON `posts` (`category_id`, `status`, `created_at`);
