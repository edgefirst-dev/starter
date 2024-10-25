import { Repository } from "app:core/repository";
import type { User } from "app:entities/user";
import { audits } from "db:schema";
import type { Entity } from "@edgefirst-dev/core";

export class AuditLogsRepository extends Repository {
	async create(user: User, action: AuditAction, auditable?: Entity) {
		let { success } = await this.db
			.insert(audits)
			.values({ action, userId: user.id, auditable: auditable?.toString() });
		if (!success) throw new Error("Failed to create audit log");
	}
}

/**List of auditable actions that can be logged. */
export type AuditAction =
	| "user_register"
	| "user_login"
	| "invalid_credentials_attempt"
	| "accepts_membership"
	| "generate_recovery_code"
	| "verified_email";
