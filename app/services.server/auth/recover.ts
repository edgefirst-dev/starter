import type { User } from "app:entities/user";
import { EmailAccountRecoveryCodeJob } from "app:jobs/email-account-recovery-code";
import {
	type AuditAction,
	AuditLogsRepository,
} from "app:repositories.server/audit-logs";
import { CredentialsRepository } from "app:repositories.server/credentials";
import { UsersRepository } from "app:repositories.server/users";
import { encodeBase32 } from "@oslojs/encoding";
import type { Email, Password } from "edgekitjs";
import { type Entity, kv, waitUntil } from "edgekitjs";

/**
 * Initiates a password recovery process by generating a one-time password (OTP).
 *
 * @param input - The recovery input data containing the email.
 * @param deps - The dependency injection object containing repositories.
 * @returns A promise that resolves to an OTP.
 * @throws {Error} If the user is not found.
 */
export async function recover(
	input: recover.Input,
	baseURL: URL,
	deps: recover.Dependencies = {
		audits: new AuditLogsRepository(),
		users: new UsersRepository(),
		credentials: new CredentialsRepository(),
	},
) {
	let [user] = await deps.users.findByEmail(input.email);
	if (!user) throw new Error("User not found");

	if (input.intent === "start") {
		let token = generateRandomOTP();

		await kv().set(`recoveryCode:${token}`, input.email.toString(), {
			ttl: 60 * 15, // 15 minutes
		});

		let url = new URL("/recover", baseURL);
		url.searchParams.set("token", token);

		EmailAccountRecoveryCodeJob.enqueue({
			email: input.email.toString(),
			url: url.toString(),
		});

		waitUntil(deps.audits.create(user, "generate_account_recovery_code"));
	}

	if (input.intent === "finish") {
		if (!(await kv().has(`recoveryCode:${input.token}`))) {
			throw new Error("Invalid recovery token");
		}

		waitUntil(kv().remove(`recoveryCode:${input.token}`));
		await deps.credentials.upsertByUser(user, input.password);
		waitUntil(deps.audits.create(user, "use_account_recovery_code"));
	}
}

/**
 * Generates a random one-time password (OTP) using Base32 encoding.
 *
 * @returns A string representing the OTP.
 */
function generateRandomOTP(): string {
	let recoveryCodeBytes = new Uint8Array(10);
	crypto.getRandomValues(recoveryCodeBytes);
	return encodeBase32(recoveryCodeBytes);
}

export namespace recover {
	/**
	 * Input data for the `recover` method.
	 * Contains the email required to initiate password recovery.
	 */
	export type Input =
		| { readonly intent: "start"; readonly email: Email }
		| {
				readonly intent: "finish";
				readonly email: Email;
				readonly password: Password;
				readonly token: string;
		  };

	export interface Dependencies {
		audits: {
			create(user: User, action: AuditAction, entity?: Entity): Promise<void>;
		};
		users: {
			findByEmail: (email: Email) => Promise<User[]>;
		};
		credentials: {
			upsertByUser(user: User, password: Password): Promise<void>;
		};
	}
}
