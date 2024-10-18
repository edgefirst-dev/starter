import type { Email } from "@edgefirst-dev/email";
import { encodeBase32 } from "@oslojs/encoding";
import { UsersRepository } from "~/repositories/users";

/**
 * Initiates a password recovery process by generating a one-time password (OTP).
 *
 * @param input - The recovery input data containing the email.
 * @param repos - The dependency injection object containing repositories.
 * @returns A promise that resolves to an OTP.
 * @throws {Error} If the user is not found.
 */
export async function recover(
	input: recover.Input,
	repos = { users: new UsersRepository() },
): Promise<recover.Output> {
	let [user] = await repos.users.findByEmail(input.email);
	if (!user) throw new Error("User not found");

	let otp = generateRandomOTP();

	return { otp };
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
		otp: string;
	}
}
