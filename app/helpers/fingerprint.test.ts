import { describe, expect, mock, test } from "bun:test";

import { User } from "app:entities/user";
import type { users } from "db:schema";
import { fingerprint } from "./fingerprint";

mock.module("@edgefirst-dev/core", () => {
	return {
		request: () =>
			new Request("https://example.com", {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
					"CF-Connecting-IP": "127.0.0.1",
				},
			}),
	};
});

describe(fingerprint.name, () => {
	test("returns a fingerprint", () => {
		expect(fingerprint()).toBe(
			"15c340949579c701e4e1d00ebf0a89c095442d74d6572ccbd93bd2d4770feb6f",
		);
	});

	test("returns a fingerprint with user", () => {
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

		let user = User.from(userRow);

		expect(fingerprint(user)).toBe(
			"604d03bc1e9867e2cabea8eead7ad26c3a2105763ed6eae0196d17973e2b1cf6",
		);
	});
});
