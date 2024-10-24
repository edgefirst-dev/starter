CREATE TABLE `sessions` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`last_activity_at` integer,
	`user_agent` text,
	`ip_address` text,
	`payload` text DEFAULT '{}',
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_id_unique` ON `sessions` (`id`);