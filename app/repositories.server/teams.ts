import type { Membership } from "app:entities/membership";
import { Team } from "app:entities/team";
import schema from "db:schema";
import { count, eq } from "drizzle-orm";
import { orm } from "edgekitjs";

export class TeamsRepository {
	async create(input: Omit<typeof schema.teams.$inferInsert, "id">) {
		let [team] = await orm().insert(schema.teams).values(input).returning();
		if (team) return Team.from(team);
		throw new Error("Failed to create team");
	}

	async findByMembership(membership: Membership) {
		let items = await orm()
			.select()
			.from(schema.teams)
			.where(eq(schema.teams.id, membership.teamId))
			.execute();

		return Team.fromMany(items);
	}

	async count() {
		let [result] = await orm()
			.select({ count: count() })
			.from(schema.teams)
			.execute();
		return result?.count ?? 0;
	}
}
