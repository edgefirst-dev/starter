CREATE TABLE `audit_logs` (
	`id` text(24) NOT NULL,
	`created_at` integer NOT NULL,
	`action` text NOT NULL,
	`auditable` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `audit_logs_id_unique` ON `audit_logs` (`id`);--> statement-breakpoint
ALTER TABLE `memberships` ADD `accepted_at` integer;--> statement-breakpoint
ALTER TABLE `memberships` ADD `role` text;--> statement-breakpoint
ALTER TABLE `users` ADD `role` text;