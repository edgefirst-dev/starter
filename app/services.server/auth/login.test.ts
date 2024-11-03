import { describe, expect, mock, test } from "bun:test";
import { Credential } from "app:entities/credential";
import { Email } from "edgekitjs";
import { Password } from "edgekitjs";
import { login } from "./login";

let waitUntil = mock().mockImplementation(
	(promise: Promise<unknown>) => void 0,
);

mock.module("edgekitjs", () => {
	return { waitUntil };
});

describe(login.name, () => {
	let email = Email.from("john.doe@company.com");
	let password = Password.from("password");
	let credential = Credential.from({
		id: "1",
		passwordHash:
			"$2a$10$phqHUOF7CTDzw4F7K3PKj.HpLkq/FvxybKb4Cnr54a4Kma997/XwK",
	});

	test("it works", async () => {
		let users = { findByEmail: mock() };
		let credentials = { findByUser: mock() };
		let memberships = { findByUser: mock() };
		let teams = { findByMembership: mock() };
		let audits = { create: mock() };

		users.findByEmail.mockImplementationOnce(async () => [{ id: "1" }]);
		credentials.findByUser.mockImplementationOnce(async () => [credential]);
		memberships.findByUser.mockImplementationOnce(async () => [{ id: "1" }]);
		teams.findByMembership.mockImplementationOnce(async () => [{ id: "1" }]);

		await login(
			{ email, password },
			{ users, credentials, memberships, teams, audits },
		);

		expect(users.findByEmail).toHaveBeenCalledWith(email);
		expect(credentials.findByUser).toHaveBeenCalledWith({ id: "1" });
		expect(memberships.findByUser).toHaveBeenCalledWith({ id: "1" });
		expect(teams.findByMembership).toHaveBeenCalledWith({ id: "1" });
		expect(audits.create).toHaveBeenCalledWith({ id: "1" }, "user_login");
	});

	test("it throws an error if the user is not found", async () => {
		let users = { findByEmail: mock() };
		let credentials = { findByUser: mock() };
		let memberships = { findByUser: mock() };
		let teams = { findByMembership: mock() };
		let audits = { create: mock() };

		users.findByEmail.mockImplementationOnce(async () => []);
		expect(
			login(
				{ email, password },
				{ users, credentials, memberships, teams, audits },
			),
		).rejects.toThrow("User not found");
	});

	test("it throws an error if the user has no credentials", async () => {
		let users = { findByEmail: mock() };
		let credentials = { findByUser: mock() };
		let memberships = { findByUser: mock() };
		let teams = { findByMembership: mock() };
		let audits = { create: mock() };

		users.findByEmail.mockImplementationOnce(async () => [{ id: "1" }]);
		credentials.findByUser.mockImplementationOnce(async () => []);
		expect(
			login(
				{ email, password },
				{ users, credentials, memberships, teams, audits },
			),
		).rejects.toThrow("User has no associated credentials");
	});

	test("it throws an error if the user has no memberships", async () => {
		let users = { findByEmail: mock() };
		let credentials = { findByUser: mock() };
		let memberships = { findByUser: mock() };
		let teams = { findByMembership: mock() };
		let audits = { create: mock() };

		users.findByEmail.mockImplementationOnce(async () => [{ id: "1" }]);
		credentials.findByUser.mockImplementationOnce(async () => [credential]);
		memberships.findByUser.mockImplementationOnce(async () => []);
		expect(
			login(
				{ email, password },
				{ users, credentials, memberships, teams, audits },
			),
		).rejects.toThrow("User has no memberships");
	});

	test("it throws an error if the user has no team", async () => {
		let users = { findByEmail: mock() };
		let credentials = { findByUser: mock() };
		let memberships = { findByUser: mock() };
		let teams = { findByMembership: mock() };
		let audits = { create: mock() };

		users.findByEmail.mockImplementationOnce(async () => [{ id: "1" }]);
		credentials.findByUser.mockImplementationOnce(async () => [credential]);
		memberships.findByUser.mockImplementationOnce(async () => [{ id: "1" }]);
		teams.findByMembership.mockImplementationOnce(async () => []);
		expect(
			login(
				{ email, password },
				{ users, credentials, memberships, teams, audits },
			),
		).rejects.toThrow("User has no team");
	});

	test("it throws an error if the credentials are invalid", async () => {
		let users = { findByEmail: mock() };
		let credentials = { findByUser: mock() };
		let memberships = { findByUser: mock() };
		let teams = { findByMembership: mock() };
		let audits = { create: mock() };

		users.findByEmail.mockImplementationOnce(async () => [{ id: "1" }]);
		credentials.findByUser.mockImplementationOnce(async () => [credential]);
		memberships.findByUser.mockImplementationOnce(async () => [{ id: "1" }]);
		teams.findByMembership.mockImplementationOnce(async () => [{ id: "1" }]);
		expect(
			login(
				{ email, password: Password.from("invalid") },
				{ users, credentials, memberships, teams, audits },
			),
		).rejects.toThrow("Invalid credentials");
	});

	test("it logs an audit entry for invalid credentials", async () => {
		let users = { findByEmail: mock() };
		let credentials = { findByUser: mock() };
		let memberships = { findByUser: mock() };
		let teams = { findByMembership: mock() };
		let audits = { create: mock() };

		users.findByEmail.mockImplementationOnce(async () => [{ id: "1" }]);
		credentials.findByUser.mockImplementationOnce(async () => [credential]);
		memberships.findByUser.mockImplementationOnce(async () => [{ id: "1" }]);
		teams.findByMembership.mockImplementationOnce(async () => [{ id: "1" }]);
		audits.create.mockImplementationOnce(async () => void 0);

		expect(
			login(
				{ email, password: Password.from("invalid") },
				{ users, credentials, memberships, teams, audits },
			),
		).rejects.toThrowError("Invalid credentials");

		expect(audits.create).toHaveBeenCalledTimes(1);
	});
});
