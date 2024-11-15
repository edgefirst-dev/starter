import { Gravatar } from "app:clients/gravatar";
import type { Credential } from "app:entities/credential";
import type { GravatarProfile } from "app:entities/gravatar-profile";
import { Membership } from "app:entities/membership";
import { Team } from "app:entities/team";
import { User } from "app:entities/user";
import { SyncUserWithGravatarJob } from "app:jobs/sync-user-with-gravatar";
import { AuditLogsRepository } from "app:repositories.server/audit-logs";
import { AuthRepository } from "app:repositories.server/auth";
import { CredentialsRepository } from "app:repositories.server/credentials";
import { MembershipsRepository } from "app:repositories.server/memberships";
import { TeamsRepository } from "app:repositories.server/teams";
import { UsersRepository } from "app:repositories.server/users";
import schema from "db:schema";
import { createId } from "@paralleldrive/cuid2";
import { Email, orm } from "edgekitjs";
import { Entity, Password, waitUntil } from "edgekitjs";

/**
 * Registers a new user by creating an account, generating a password hash,
 * and setting up a personal team.
 *
 * @param input - The registration input data containing the email and password.
 * @param deps - The dependency injection object containing repositories.
 * @returns A promise that resolves to the newly created user and team.
 * @throws {Error} If the user already exists or if the registration process fails.
 */
export async function register(
	input: register.Input,
	deps: register.Dependencies = {
		auth: new AuthRepository(),
		audits: new AuditLogsRepository(),
		users: new UsersRepository(),
		gravatar: new Gravatar(),
	},
): Promise<register.Output> {
	await input.email.verify();
	await input.password.isStrong();

	await deps.users.findByEmail(input.email).then(([user]) => {
		if (user) throw new Error("User already exists");
	});

	let displayName = input.displayName;

	// If the display name is not provided, try to fetch it from Gravatar
	if (!displayName) {
		SyncUserWithGravatarJob.enqueue({ email: input.email.toString() });
	}

	let { user, team, membership } = await deps.auth.register({
		email: input.email,
		password: input.password,
		displayName,
	});

	waitUntil(deps.audits.create(user, "user_register"));
	waitUntil(deps.audits.create(user, "accepts_membership", membership));

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

	export interface Dependencies {
		auth: {
			register(
				input: AuthRepository.RegisterInput,
			): Promise<AuthRepository.RegisterOutput>;
		};
		audits: {
			create(user: User, action: string, entity?: Entity): Promise<void>;
		};
		users: {
			findByEmail(email: Email): Promise<User[]>;
		};
		gravatar: {
			profile(email: Email): Promise<GravatarProfile>;
		};
	}
}
