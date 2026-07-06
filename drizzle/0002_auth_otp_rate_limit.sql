CREATE TABLE `otp_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer NOT NULL,
	`last_sent_at` integer NOT NULL
);
