PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_audit_logs` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`action` text,
	`auditable` text,
	`payload` text DEFAULT '{}',
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_audit_logs`("id", "created_at", "action", "auditable", "payload", "user_id") SELECT "id", "created_at", "action", "auditable", "payload", "user_id" FROM `audit_logs`;--> statement-breakpoint
DROP TABLE `audit_logs`;--> statement-breakpoint
ALTER TABLE `__new_audit_logs` RENAME TO `audit_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `audit_logs_id_unique` ON `audit_logs` (`id`);--> statement-breakpoint
CREATE INDEX `audit_logs_user_id_idx` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_users_credentials` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`password_hash` text NOT NULL,
	`reset_token` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_users_credentials`("id", "created_at", "updated_at", "password_hash", "reset_token", "user_id") SELECT "id", "created_at", "updated_at", "password_hash", "reset_token", "user_id" FROM `users_credentials`;--> statement-breakpoint
DROP TABLE `users_credentials`;--> statement-breakpoint
ALTER TABLE `__new_users_credentials` RENAME TO `users_credentials`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_credentials_id_unique` ON `users_credentials` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_credentials_reset_token_unique` ON `users_credentials` (`reset_token`);--> statement-breakpoint
CREATE INDEX `users_credentials_user_id_idx` ON `users_credentials` (`user_id`);--> statement-breakpoint
CREATE INDEX `users_credentials_reset_token_idx` ON `users_credentials` (`reset_token`);--> statement-breakpoint
CREATE TABLE `__new_memberships` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`accepted_at` integer,
	`role` text DEFAULT 'member' NOT NULL,
	`user_id` text NOT NULL,
	`team_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_memberships`("id", "created_at", "updated_at", "accepted_at", "role", "user_id", "team_id") SELECT "id", "created_at", "updated_at", "accepted_at", "role", "user_id", "team_id" FROM `memberships`;--> statement-breakpoint
DROP TABLE `memberships`;--> statement-breakpoint
ALTER TABLE `__new_memberships` RENAME TO `memberships`;--> statement-breakpoint
CREATE UNIQUE INDEX `memberships_id_unique` ON `memberships` (`id`);--> statement-breakpoint
CREATE INDEX `memberships_user_id_idx` ON `memberships` (`user_id`);--> statement-breakpoint
CREATE INDEX `memberships_user_team_idx` ON `memberships` (`user_id`,`team_id`);--> statement-breakpoint
CREATE INDEX `memberships_team_id_idx` ON `memberships` (`team_id`);--> statement-breakpoint
CREATE INDEX `memberships_team_user_idx` ON `memberships` (`team_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`last_activity_at` integer,
	`user_agent` text,
	`ip_address` text,
	`payload` text DEFAULT '{}',
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "created_at", "updated_at", "last_activity_at", "user_agent", "ip_address", "payload", "user_id") SELECT "id", "created_at", "updated_at", "last_activity_at", "user_agent", "ip_address", "payload", "user_id" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_id_unique` ON `sessions` (`id`);