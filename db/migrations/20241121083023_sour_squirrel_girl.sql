DROP INDEX IF EXISTS `users_credentials_reset_token_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `users_credentials_reset_token_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_credentials_user_id_unique` ON `users_credentials` (`user_id`);--> statement-breakpoint
ALTER TABLE `users_credentials` DROP COLUMN `reset_token`;