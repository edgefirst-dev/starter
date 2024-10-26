import { describe, expect, test } from "bun:test";
import type { users } from "db:schema";

import { Email } from "@edgefirst-dev/email";
import { User } from "./user";

describe(User.name, () => {
	let userRow: typeof users.$inferSelect = {
		// biome-ignore lint/suspicious/noExplicitAny: It's a test
		id: "a3j3p00nmf5fnhggm9zqc6l8" as any,
		createdAt: new Date(),
		updatedAt: new Date(),
		email: "john.doe@example.com",
		emailVerifiedAt: new Date(),
		emailVerificationToken: "xijjlqpjwls8h18k1fn49r6y",
		displayName: null,
		avatarKey: null,
		role: "user",
	};

	test("#constructor", () => {
		let user = User.from(userRow);
		expect(user).toBeInstanceOf(User);
		expect(user.toString()).toBe("user:a3j3p00nmf5fnhggm9zqc6l8");
	});

	test("get email", () => {
		let user = User.from(userRow);
		expect(user.email).toBeInstanceOf(Email);
	});

	test("get emailVerifiedAt", () => {
		let user = User.from(userRow);
		expect(user.emailVerifiedAt).toBeInstanceOf(Date);
	});

	test("get hasEmailVerified", () => {
		let user = User.from(userRow);
		expect(user.hasEmailVerified).toBe(true);
	});

	test("#avatar fallbacks to Gravatar if no avatarKey", () => {
		let user = User.from(userRow);
		expect(user.avatar).toBe(
			"https://gravatar.com/avatar/836f82db99121b3481011f16b49dfa5fbc714a0d1b1b9f784a1ebbbf5b39577f",
		);
	});

	test("#diplayName fallbacks to the email's username", () => {
		let user = User.from(userRow);
		expect(user.displayName).toBe("john.doe");
	});

	test("#role", () => {
		let user = User.from(userRow);
		expect(user.role).toBe("user");
	});

	test("#isRoot", () => {
		let user = User.from(userRow);
		expect(user.isRoot).toBe(false);
	});
});
