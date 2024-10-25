import type { Membership } from "app:entities/membership";
import type { Team } from "app:entities/team";
import type { User } from "app:entities/user";

import { AuditLogsRepository } from "app:repositories.server/audit-logs";
import { CredentialsRepository } from "app:repositories.server/credentials";
import { MembershipsRepository } from "app:repositories.server/memberships";
import { TeamsRepository } from "app:repositories.server/teams";
import { UsersRepository } from "app:repositories.server/users";
import type { Password } from "@edgefirst-dev/core";
import { Email } from "@edgefirst-dev/email";

/**
 * Logs in a user by verifying the provided email and password.
 *
 * @param input - The login input data containing the email and password.
 * @param repos - The dependency injection object containing repositories.
 * @returns A promise that resolves to the logged-in user.
 * @throws {Error} If the user is not found or the credentials are invalid.
 */
export async function login(
	input: login.Input,
	repos = {
		audits: new AuditLogsRepository(),
		users: new UsersRepository(),
		teams: new TeamsRepository(),
		credentials: new CredentialsRepository(),
		memberships: new MembershipsRepository(),
	},
): Promise<login.Output> {
	let [user] = await repos.users.findByEmail(input.email);
	if (!user) throw new Error("User not found");

	let [credential] = await repos.credentials.findByUser(user);
	if (!credential) throw new Error("User has no associated credentials");

	// Compare the provided password with the stored password hash
	if (await credential.match(input.password)) {
		let memberships = await repos.memberships.findByUser(user);
		if (memberships.length === 0) throw new Error("User has no memberships");
		// biome-ignore lint/style/noNonNullAssertion: We know there's one element
		let [team] = await repos.teams.findByMembership(memberships.at(0)!);
		if (!team) throw new Error("User has no team");
		await repos.audits.create(user, "user_login");
		return { user, team, memberships };
	}

	await repos.audits.create(user, "invalid_credentials_attempt", credential);

	throw new Error("Invalid credentials");
}

export namespace login {
	/**
	 * Input data for the `login` method.
	 * Contains the email and password required for user login.
	 */
	export interface Input {
		/** The user's email address. */
		readonly email: Email;
		/** The user's password. */
		readonly password: Password;
	}

	/**
	 * Output data returned by the `login` method.
	 * Contains the logged-in user's information.
	 */
	export interface Output {
		/** The user object created during registration. */
		user: User;
		/** The team object created during registration. */
		team: Team;
		/** The membership object linking the user to the team. */
		memberships: Membership[];
	}
}
