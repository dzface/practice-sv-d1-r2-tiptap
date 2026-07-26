CREATE TABLE `point_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`point_name` text DEFAULT '포인트' NOT NULL,
	`max_level` integer DEFAULT 5 NOT NULL,
	`block_download_for_users` integer DEFAULT 0 NOT NULL,
	`block_read_for_users` integer DEFAULT 0 NOT NULL,
	`event_values` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
