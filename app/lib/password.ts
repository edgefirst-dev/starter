import { PwnedPasswords } from "app:clients/pwned-password";
import bcrypt from "bcryptjs";

const MIN_LENGTH = 8;
const SALT_ROUNDS = 10;

/**
 * The `Password` class provides methods for securely hashing, comparing, and
 * checking the strength of passwords. It integrates with `bcrypt` for hashing
 * and comparison and also checks for weak or compromised passwords using
 * both strength rules and the Pwned Passwords API.
 */
export class Password {
	/**
	 * Static factory method to create a `Password` instance.
	 *
	 * @param value - The plain text password.
	 * @returns A new `Password` instance.
	 */
	public static from(value: string) {
		return new Password(value);
	}

	/**
	 * Private constructor for the `Password` class.
	 *
	 * @param value - The plain text password.
	 */
	private constructor(private value: string) {}

	/**
	 * Hashes the password using `bcrypt` with a customizable salt rounds factor.
	 *
	 * @param salt - The number of salt rounds to use. Defaults to 10.
	 * @returns A promise that resolves to the hashed password.
	 */
	public hash(salt = SALT_ROUNDS) {
		return bcrypt.hash(this.value, salt);
	}

	/**
	 * Compares the plain text password with a hashed password using `bcrypt`.
	 *
	 * @param hashed - The hashed password to compare against.
	 * @returns A promise that resolves to `true` if the passwords match, otherwise `false`.
	 */
	public compare(hashed: string) {
		return bcrypt.compare(this.value, hashed);
	}

	/**
	 * Checks if the password is weak. A password is considered weak if it does
	 * not meet the following criteria:
	 * - Minimum length of 8 characters (configured with a constant).
	 * - Contains at least one lowercase letter.
	 * - Contains at least one uppercase letter.
	 * - Contains at least one number.
	 * - Contains at least one special character.
	 * - Not found in the Pwned Passwords database.
	 *
	 * @throws {WeakPasswordError} If the password is considered weak.
	 * @returns A promise that resolves if the password is strong, otherwise throws an error.
	 */
	public async isStrong() {
		if (this.value.length < MIN_LENGTH) {
			throw new WeakPasswordError(
				`Password must be at least ${MIN_LENGTH} characters long`,
			);
		}

		if (!/[a-z]/.test(this.value)) {
			throw new WeakPasswordError(
				"Password must contain at least one lowercase letter",
			);
		}

		if (!/[A-Z]/.test(this.value)) {
			throw new WeakPasswordError(
				"Password must contain at least one uppercase letter",
			);
		}

		if (!/\d/.test(this.value)) {
			throw new WeakPasswordError("Password must contain at least one number");
		}

		if (!/([^\dA-Za-z]+)/g.test(this.value)) {
			throw new WeakPasswordError(
				"Password must contain at least one special character",
			);
		}

		if (await this.isPwned()) {
			throw new WeakPasswordError("Password is included in a data breach");
		}
	}

	/**
	 * Private method to check if the password has been compromised using the
	 * Pwned Passwords API.
	 *
	 * @returns A promise that resolves to `true` if the password has been found
	 * in a data breach, otherwise `false`.
	 */
	private async isPwned() {
		let hash = PwnedPasswords.hash(this.value);
		return await new PwnedPasswords().isPwned(hash);
	}

	toJSON() {
		return "<REDACTED>";
	}
}

/**
 * The `WeakPasswordError` is thrown when a password fails the strength
 * requirements or is found in a known data breach.
 */
export class WeakPasswordError extends Error {
	override name = "WeakPasswordError";
}
