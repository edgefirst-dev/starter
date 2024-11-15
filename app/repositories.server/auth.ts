import { Membership } from "app:entities/membership";
import { Team } from "app:entities/team";
import { User } from "app:entities/user";
import schema from "db:schema";
import { createId } from "@paralleldrive/cuid2";
import { type Email, type Password, orm } from "edgekitjs";

export class AuthRepository {
	async register(input: AuthRepository.RegisterInput) {
		let db = orm();

		let userId = createId();
		let teamId = createId();

		let passwordHash = await input.password.hash();

		let [users, , teams, memberships] = await db.batch([
			db
				.insert(schema.users)
				.values({
					id: userId,
					email: input.email.toString(),
					displayName: input.displayName,
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

		return { user, team, membership };
	}
}

export namespace AuthRepository {
	/**
	 * Input data for the `register` method.
	 * Contains the email and password required for user registration.
	 */
	export interface RegisterInput {
		/** The users's display name. */
		readonly displayName: string | null;
		/** The user's email address. */
		readonly email: Email;
		/** The user's password. */
		readonly password: Password;
	}

	export interface RegisterOutput {
		readonly user: User;
		readonly team: Team;
		readonly membership: Membership;
	}
}
