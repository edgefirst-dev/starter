import { describe, expect, test } from "bun:test";
import type { users } from "db:schema";

import type { CUID } from "app:lib/string-parser";
import { User } from "./user";

describe(User.name, () => {
	let userRow: typeof users.$inferSelect = {
		id: "a3j3p00nmf5fnhggm9zqc6l8" as CUID,
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
