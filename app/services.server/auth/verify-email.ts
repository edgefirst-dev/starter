import { AuditLogsRepository } from "app:repositories.server/audit-logs";
import { UsersRepository } from "app:repositories.server/users";
import type { Email } from "@edgefirst-dev/email";

/**
 * Verifies a user's email address by setting the `emailVerifiedAt` field.
 *
 * @param input - The registration input data containing the email and password.
 * @param repos - The dependency injection object containing repositories.
 * @throws {Error} If the user is not found.
 * @returns A promise that resolves when the email is verified, or immediately if the user is already verified.
 */
export async function verifyEmail(
	input: verifyEmail.Input,
	repos = {
		audits: new AuditLogsRepository(),
		user: new UsersRepository(),
	},
) {
	let [user] = await repos.user.findByEmail(input.email);
	if (!user) throw new Error("User not found");

	// If the user is already verified, we don't need to do anything
	if (user.hasEmailVerified) return;

	// Here we should validate that data.code is valid

	await repos.user.verifyEmail(user);

	await repos.audits.create(user, "verified_email");
}

export namespace verifyEmail {
	export interface Input {
		readonly email: Email;
		readonly code: string;
	}
}
