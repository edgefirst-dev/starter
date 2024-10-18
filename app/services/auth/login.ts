import type { Membership } from "~/entities/membership";
import type { Team } from "~/entities/team";
import type { User } from "~/entities/user";

import { Email } from "@edgefirst-dev/email";
import { Password } from "~/lib/password";
import { CredentialsRepository } from "~/repositories/credentials";
import { MembershipsRepository } from "~/repositories/memberships";
import { TeamsRepository } from "~/repositories/teams";
import { UsersRepository } from "~/repositories/users";

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
		users: new UsersRepository(),
		teams: new TeamsRepository(),
		credentials: new CredentialsRepository(),
		memberships: new MembershipsRepository(),
	},
): Promise<login.Output> {
	let [user] = await repos.users.findByEmail(input.email);
	if (!user) throw new Error("User not found");

	let [credential] = await repos.credentials.findByUserId(user.id);
	if (!credential) throw new Error("User has no associated credentials");

	// Compare the provided password with the stored password hash
	if (await credential.match(input.password)) {
		let memberships = await repos.memberships.findByUser(user);
		if (memberships.length === 0) throw new Error("User has no memberships");
		// biome-ignore lint/style/noNonNullAssertion: We know there's one element
		let [team] = await repos.teams.findByMembership(memberships.at(0)!);
		if (!team) throw new Error("User has no team");
		return { user, team, memberships };
	}

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
