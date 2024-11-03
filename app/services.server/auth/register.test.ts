import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";

import { emailVerifier, pwnedPasswords } from "app:mocks/server";
import { Email } from "edgekitjs";
import { Password } from "edgekitjs";
import { setupServer } from "msw/native";
import { register } from "./register";

mock.module("edgekitjs", () => {
	return {
		waitUntil: mock().mockImplementation((promise: Promise<unknown>) => void 0),
		queue: mock().mockImplementation(() => {
			return {
				enqueue: mock().mockImplementation(() => void 0),
			};
		}),
		env: mock().mockImplementation(() => {
			return {
				fetch: mock().mockImplementation((key) => key),
			};
		}),
	};
});

describe(register.name, () => {
	let email = Email.from("john.doe@company.com");
	let password = Password.from("abcDEF123!@#");
	let server = setupServer();

	beforeAll(() => server.listen());
	afterAll(() => server.close());

	test("it works", async () => {
		server.resetHandlers(pwnedPasswords.strong, emailVerifier.valid);

		let users = { findByEmail: mock(), create: mock() };
		let credentials = { create: mock() };
		let memberships = { create: mock() };
		let teams = { create: mock() };
		let audits = { create: mock() };
		let gravatar = { profile: mock() };

		users.findByEmail.mockResolvedValue([]);
		users.create.mockResolvedValue({ id: "1" });
		teams.create.mockResolvedValue({ id: "1" });
		memberships.create.mockResolvedValue({ id: "1" });
		audits.create.mockResolvedValue({ id: "1" });
		gravatar.profile.mockResolvedValue(null);

		await register(
			{ email, password, displayName: null },
			{ users, credentials, memberships, teams, audits, gravatar },
		);

		expect(users.findByEmail).toHaveBeenCalledWith(email);
		expect(users.create).toHaveBeenCalledWith({
			email: email.toString(),
			displayName: null,
		});
		expect(teams.create).toHaveBeenCalled();
		expect(memberships.create).toHaveBeenCalledWith({
			userId: expect.any(String),
			teamId: expect.any(String),
			role: "owner",
			acceptedAt: expect.any(Date),
		});
		expect(audits.create).toHaveBeenCalledWith(
			expect.any(Object),
			"user_register",
		);
	});

	test("it throws an error if the user already exists", async () => {
		server.resetHandlers(pwnedPasswords.strong, emailVerifier.valid);

		let users = { findByEmail: mock(), create: mock() };
		let credentials = { create: mock() };
		let memberships = { create: mock() };
		let teams = { create: mock() };
		let audits = { create: mock() };
		let gravatar = { profile: mock() };

		users.findByEmail.mockResolvedValue([{ id: "1" }]);

		expect(
			register(
				{ email, password, displayName: null },
				{ users, credentials, memberships, teams, audits, gravatar },
			),
		).rejects.toThrow("User already exists");
	});

	test("it throws an error if the password is weak", async () => {
		server.resetHandlers(pwnedPasswords.weak, emailVerifier.valid);

		let users = { findByEmail: mock(), create: mock() };
		let credentials = { create: mock() };
		let memberships = { create: mock() };
		let teams = { create: mock() };
		let audits = { create: mock() };
		let gravatar = { profile: mock() };

		users.findByEmail.mockResolvedValue([]);
		users.create.mockResolvedValue({ id: "1" });

		expect(
			register(
				{ email, password, displayName: null },
				{ users, credentials, memberships, teams, audits, gravatar },
			),
		).rejects.toThrow("Password is included in a data breach");
	});

	test("it throws an error if the email is invalid", async () => {
		server.resetHandlers(pwnedPasswords.strong, emailVerifier.invalid);

		let users = { findByEmail: mock(), create: mock() };
		let credentials = { create: mock() };
		let memberships = { create: mock() };
		let teams = { create: mock() };
		let audits = { create: mock() };
		let gravatar = { profile: mock() };

		users.findByEmail.mockResolvedValue([]);

		expect(
			register(
				{ email, password, displayName: null },
				{ users, credentials, memberships, teams, audits, gravatar },
			),
		).rejects.toThrow("Disposable email address");
	});
});
