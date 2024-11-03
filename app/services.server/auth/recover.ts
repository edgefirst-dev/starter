import type { Credential } from "app:entities/credential";
import type { User } from "app:entities/user";
import { AuditLogsRepository } from "app:repositories.server/audit-logs";
import { CredentialsRepository } from "app:repositories.server/credentials";
import { UsersRepository } from "app:repositories.server/users";
import { encodeBase32 } from "@oslojs/encoding";
import type { Email } from "edgekitjs";
import { type Entity, waitUntil } from "edgekitjs";

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
	deps: recover.Dependencies = {
		audits: new AuditLogsRepository(),
		users: new UsersRepository(),
		credentials: new CredentialsRepository(),
	},
): Promise<recover.Output> {
	let [user] = await deps.users.findByEmail(input.email);
	if (!user) throw new Error("User not found");

	let [credential] = await deps.credentials.findByUser(user);
	if (!credential) throw new Error("User has no associated credentials");

	let token = generateRandomOTP();

	await deps.credentials.createResetToken(credential, token);

	waitUntil(deps.audits.create(user, "generate_recovery_code"));

	return { token };
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
	export interface Input {
		/** The user's email address. */
		readonly email: Email;
	}

	/**
	 * Output data returned by the `recover` method.
	 * Contains the generated one-time password (OTP).
	 */
	export interface Output {
		/** The generated OTP (one-time password) for recovery. */
		token: string;
	}

	export interface Dependencies {
		audits: {
			create(user: User, action: string, entity?: Entity): Promise<void>;
		};
		users: {
			findByEmail: (email: Email) => Promise<User[]>;
		};
		credentials: {
			findByUser: (user: User) => Promise<Credential[]>;
			createResetToken: (
				credential: Credential,
				token: string,
			) => Promise<void>;
		};
	}
}
