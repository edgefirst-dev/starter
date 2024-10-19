PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_audit_logs` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`action` text,
	`auditable` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_audit_logs`("id", "created_at", "action", "auditable", "user_id") SELECT "id", "created_at", "action", "auditable", "user_id" FROM `audit_logs`;--> statement-breakpoint
DROP TABLE `audit_logs`;--> statement-breakpoint
ALTER TABLE `__new_audit_logs` RENAME TO `audit_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `audit_logs_id_unique` ON `audit_logs` (`id`);--> statement-breakpoint
CREATE TABLE `__new_memberships` (
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
INSERT INTO `__new_memberships`("id", "created_at", "updated_at", "accepted_at", "role", "user_id", "team_id") SELECT "id", "created_at", "updated_at", "accepted_at", "role", "user_id", "team_id" FROM `memberships`;--> statement-breakpoint
DROP TABLE `memberships`;--> statement-breakpoint
ALTER TABLE `__new_memberships` RENAME TO `memberships`;--> statement-breakpoint
CREATE UNIQUE INDEX `memberships_id_unique` ON `memberships` (`id`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`email_verified_at` integer,
	`display_name` text,
	`email` text,
	`avatar_key` text(24),
	`role` text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "created_at", "updated_at", "email_verified_at", "display_name", "email", "avatar_key", "role") SELECT "id", "created_at", "updated_at", "email_verified_at", "display_name", "email", "avatar_key", "role" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);