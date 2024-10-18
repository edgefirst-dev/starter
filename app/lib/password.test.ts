import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";

import { http } from "msw";
import { setupServer } from "msw/native";
import { Password } from "./password";

mock.module("@edgefirst-dev/core", () => {
	return {
		env() {
			return {
				fetch(key: string): string {
					return key;
				},
			};
		},
	};
});

let server = setupServer();

describe(Password.name, () => {
	beforeAll(() => server.listen());
	afterAll(() => server.close());

	test(".from() using string", () => {
		let password = Password.from("password");
		expect(password).toBeInstanceOf(Password);
	});

	test("#hash with default", () => {
		let password = Password.from("password");
		expect(password.hash()).resolves.toBeString();
	});

	test("#hash with salt rounds", () => {
		let password = Password.from("password");
		expect(password.hash(5)).resolves.toBeString();
	});

	test("#compare", async () => {
		let password = Password.from("password");
		let hashed = await password.hash();
		expect(password.compare(hashed)).resolves.toBeTrue();
	});

	test("#isWeak with short password", async () => {
		let password = Password.from("pass");
		expect(password.isStrong()).rejects.toThrowError(
			"Password must be at least 8 characters long",
		);
	});

	test("#isWeak with no lowercase", async () => {
		let password = Password.from("PASSWORD");
		expect(password.isStrong()).rejects.toThrowError(
			"Password must contain at least one lowercase letter",
		);
	});

	test("#isWeak with no uppercase", async () => {
		let password = Password.from("password");
		expect(password.isStrong()).rejects.toThrowError(
			"Password must contain at least one uppercase letter",
		);
	});

	test("#isWeak with no number", async () => {
		let password = Password.from("Password");
		expect(password.isStrong()).rejects.toThrowError(
			"Password must contain at least one number",
		);
	});

	test("#isWeak with no special character", async () => {
		let password = Password.from("Password1");
		expect(password.isStrong()).rejects.toThrowError(
			"Password must contain at least one special character",
		);
	});

	test("#isWeak with pwned password", async () => {
		let password = Password.from("abcDEF123!@#");

		server.resetHandlers(
			http.get("https://api.pwnedpasswords.com/range/42a48", () => {
				return new Response("d2f5c131c7ab9fbc431622225e430a49ccd");
			}),
		);

		expect(password.isStrong()).rejects.toThrowError(
			"Password is included in a data breach",
		);
	});

	test("#isWeak with strong password", async () => {
		let password = Password.from("abcDEF123!@#");

		server.resetHandlers(
			http.get("https://api.pwnedpasswords.com/range/42a48", () => {
				return new Response("1da2f5c1331c7ab39fbc431622225e4f30a49ccd");
			}),
		);

		expect(password.isStrong()).resolves.toBeUndefined();
	});
});
