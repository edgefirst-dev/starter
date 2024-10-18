import { Gravatar } from "app:clients/gravatar";
import type { Membership } from "app:entities/membership";
import type { Team } from "app:entities/team";
import type { User } from "app:entities/user";
import { Password } from "app:lib/password";
import { CredentialsRepository } from "app:repositories.server/credentials";
import { MembershipsRepository } from "app:repositories.server/memberships";
import { TeamsRepository } from "app:repositories.server/teams";
import { UsersRepository } from "app:repositories.server/users";
import { Email } from "@edgefirst-dev/email";

/**
 * Registers a new user by creating an account, generating a password hash,
 * and setting up a personal team.
 *
 * @param input - The registration input data containing the email and password.
 * @param repos - The dependency injection object containing repositories.
 * @returns A promise that resolves to the newly created user and team.
 * @throws {Error} If the user already exists or if the registration process fails.
 */
export async function register(
	input: register.Input,
	repos = {
		users: new UsersRepository(),
		teams: new TeamsRepository(),
		memberships: new MembershipsRepository(),
		credentials: new CredentialsRepository(),
		gravatar: new Gravatar(),
	},
): Promise<register.Output> {
	await input.email.verify();
	await input.password.isStrong();

	let passwordHash = await input.password.hash();

	await repos.users.findByEmail(input.email).then(([user]) => {
		if (user) throw new Error("User already exists");
	});

	let displayName = input.displayName;

	// If the display name is not provided, try to fetch it from Gravatar
	if (!displayName) {
		displayName = await repos.gravatar
			.profile(input.email)
			.then((profile) => profile.displayName)
			.catch((error) => {
				// In case of error we want to log it and continue the process
				console.error(error);
				return null;
			});
	}

	let user = await repos.users.create({
		email: input.email.toString(),
		displayName,
	});

	await repos.credentials.create({ userId: user.id, passwordHash });

	let team = await repos.teams.create({ name: "Personal Team" });

	let membership = await repos.memberships.create({
		userId: user.id,
		teamId: team.id,
	});

	return { user, team, membership };
}

export namespace register {
	/**
	 * Input data for the `register` method.
	 * Contains the email and password required for user registration.
	 */
	export interface Input {
		/** The users's display name. */
		readonly displayName: string | null;
		/** The user's email address. */
		readonly email: Email;
		/** The user's password. */
		readonly password: Password;
	}

	/**
	 * Output data returned by the `register` method.
	 * Contains the created user and associated team information.
	 */
	export interface Output {
		/** The user object created during registration. */
		user: User;
		/** The team object created during registration. */
		team: Team;
		/** The membership object linking the user to the team. */
		membership: Membership;
	}
}
