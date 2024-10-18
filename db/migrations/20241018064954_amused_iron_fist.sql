CREATE TABLE `users_credentials` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`password_hash` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_credentials_id_unique` ON `users_credentials` (`id`);--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_id` text NOT NULL,
	`team_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `memberships_id_unique` ON `memberships` (`id`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_id_unique` ON `teams` (`id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`email_verified_at` integer,
	`display_name` text,
	`email` text,
	`avatar_key` text(24)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);