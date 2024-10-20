PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`email_verified_at` integer,
	`display_name` text,
	`email` text NOT NULL,
	`avatar_key` text(24),
	`role` text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "created_at", "updated_at", "email_verified_at", "display_name", "email", "avatar_key", "role") SELECT "id", "created_at", "updated_at", "email_verified_at", "display_name", "email", "avatar_key", "role" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);