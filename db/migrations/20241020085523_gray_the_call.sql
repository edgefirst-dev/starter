CREATE TABLE `audit_logs` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`action` text,
	`auditable` text,
	`payload` text DEFAULT '{}',
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `audit_logs_id_unique` ON `audit_logs` (`id`);--> statement-breakpoint
CREATE INDEX `audit_logs_user_id_idx` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE `users_credentials` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`password_hash` text NOT NULL,
	`reset_token` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_credentials_id_unique` ON `users_credentials` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_credentials_reset_token_unique` ON `users_credentials` (`reset_token`);--> statement-breakpoint
CREATE INDEX `users_credentials_user_id_idx` ON `users_credentials` (`user_id`);--> statement-breakpoint
CREATE INDEX `users_credentials_reset_token_idx` ON `users_credentials` (`reset_token`);--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`accepted_at` integer,
	`role` text DEFAULT 'member' NOT NULL,
	`user_id` text NOT NULL,
	`team_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `memberships_id_unique` ON `memberships` (`id`);--> statement-breakpoint
CREATE INDEX `memberships_user_id_idx` ON `memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `memberships_user_team_idx` ON `memberships` (`user_id`,`team_id`);--> statement-breakpoint
CREATE INDEX `memberships_team_id_idx` ON `memberships` (`team_id`);--> statement-breakpoint
CREATE INDEX `memberships_team_user_idx` ON `memberships` (`team_id`,`user_id`);--> statement-breakpoint
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
	`email` text NOT NULL,
	`avatar_key` text(24),
	`role` text DEFAULT 'user',
	`email_verification_token` text(24) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_verification_token_unique` ON `users` (`email_verification_token`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);