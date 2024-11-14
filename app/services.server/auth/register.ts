import { Gravatar } from "app:clients/gravatar";
import type { Credential } from "app:entities/credential";
import type { GravatarProfile } from "app:entities/gravatar-profile";
import { Membership } from "app:entities/membership";
import { Team } from "app:entities/team";
import { User } from "app:entities/user";
import { SyncUserWithGravatarJob } from "app:jobs/sync-user-with-gravatar";
import { AuditLogsRepository } from "app:repositories.server/audit-logs";
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
		audits: new AuditLogsRepository(),
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

	await deps.users.findByEmail(input.email).then(([user]) => {
		if (user) throw new Error("User already exists");
	});

	let displayName = input.displayName;

	// If the display name is not provided, try to fetch it from Gravatar
	if (!displayName) {
		SyncUserWithGravatarJob.enqueue({ email: input.email.toString() });
	}

	let db = orm();

	let userId = createId();
	let teamId = createId();

	console.log({ userId, teamId });

	let [users, , teams, memberships] = await db.batch([
		db
			.insert(schema.users)
			.values({
				id: userId,
				email: input.email.toString(),
				displayName,
			})
			.returning(),
		db.insert(schema.credentials).values({ userId, passwordHash }),
		db
			.insert(schema.teams)
			.values({ id: teamId, name: "Personal Team" })
			.returning(),
		db
			.insert(schema.memberships)
			.values({
				userId,
				teamId,
				role: "owner", // A user is the owner of their personal team
				acceptedAt: new Date(), // Automatically accept the membership
			})
			.returning(),
	]);

	let [user] = User.fromMany(users);
	let [team] = Team.fromMany(teams);
	let [membership] = Membership.fromMany(memberships);

	if (!user || !team || !membership) {
		throw new Error("Failed to register the user");
	}

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
		audits: {
			create(user: User, action: string, entity?: Entity): Promise<void>;
		};
		users: {
			findByEmail(email: Email): Promise<User[]>;
			create(data: {
				email: string;
				displayName: string | null;
			}): Promise<User>;
		};
		teams: {
			create(data: { name: string }): Promise<Team>;
		};
		memberships: {
			create(
				data: Pick<
					typeof schema.memberships.$inferInsert,
					"teamId" | "userId" | "role" | "acceptedAt"
				>,
			): Promise<Membership>;
		};
		credentials: {
			create(
				data: Pick<
					typeof schema.credentials.$inferInsert,
					"userId" | "passwordHash"
				>,
			): Promise<Credential>;
		};
		gravatar: {
			profile(email: Email): Promise<GravatarProfile>;
		};
	}
}
