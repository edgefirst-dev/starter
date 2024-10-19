import { Repository } from "app:core/repository";
import { Membership } from "app:entities/membership";
import type { User } from "app:entities/user";
import { memberships } from "db:schema";
import { eq } from "drizzle-orm";

export class MembershipsRepository extends Repository {
	async create(
		input: Pick<
			typeof memberships.$inferInsert,
			"teamId" | "userId" | "role" | "acceptedAt"
		>,
	) {
		let [membership] = await this.db
			.insert(memberships)
			.values(input)
			.returning();
		if (membership) return Membership.from(membership);
		throw new Error("Failed to create membership");
	}

	async findByUser(user: User) {
		let items = await this.db
			.select()
			.from(memberships)
			.where(eq(memberships.userId, user.id))
			.execute();

		return Membership.fromMany(items);
	}
}
