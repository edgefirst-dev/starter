import { Repository } from "app:core/repository";
import { Credential } from "app:entities/credential";
import { credentials } from "db:schema";
import { eq } from "drizzle-orm";

export class CredentialsRepository extends Repository {
	async create(
		input: Pick<typeof credentials.$inferInsert, "userId" | "passwordHash">,
	) {
		let [credential] = await this.db
			.insert(credentials)
			.values(input)
			.returning();

		if (credential) return Credential.from(credential);
		throw new Error("Failed to create user credential");
	}

	async findByUserId(userId: string) {
		let list = await this.db
			.select()
			.from(credentials)
			.where(eq(credentials.userId, userId))
			.limit(1)
			.execute();

		return Credential.fromMany(list);
	}
}
