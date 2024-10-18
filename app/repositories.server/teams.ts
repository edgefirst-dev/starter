import { Repository } from "app:core/repository";
import type { Membership } from "app:entities/membership";
import { Team } from "app:entities/team";
import { teams } from "db:schema";
import { eq } from "drizzle-orm";

export class TeamsRepository extends Repository {
	async create(input: Omit<typeof teams.$inferInsert, "id">) {
		let [team] = await this.db.insert(teams).values(input).returning();
		if (team) return Team.from(team);
		throw new Error("Failed to create team");
	}

	async findByMembership(membership: Membership) {
		let items = await this.db
			.select()
			.from(teams)
			.where(eq(teams.id, membership.teamId))
			.execute();

		return Team.fromMany(items);
	}
}
