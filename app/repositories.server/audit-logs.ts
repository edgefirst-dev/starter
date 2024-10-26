import type { User } from "app:entities/user";
import { audits } from "db:schema";
import { type Entity, orm } from "@edgefirst-dev/core";

export class AuditLogsRepository {
	async create(user: User, action: AuditAction, auditable?: Entity) {
		let { success } = await orm()
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
