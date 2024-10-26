import type { Membership } from "app:entities/membership";
import { Team } from "app:entities/team";
import { teams } from "db:schema";
import { orm } from "@edgefirst-dev/core";
import { eq } from "drizzle-orm";

export class TeamsRepository {
	async create(input: Omit<typeof teams.$inferInsert, "id">) {
		let [team] = await orm().insert(teams).values(input).returning();
		if (team) return Team.from(team);
		throw new Error("Failed to create team");
	}

	async findByMembership(membership: Membership) {
		let items = await orm()
			.select()
			.from(teams)
			.where(eq(teams.id, membership.teamId))
			.execute();

		return Team.fromMany(items);
	}
}
