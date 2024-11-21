import { Credential } from "app:entities/credential";
import type { User } from "app:entities/user";
import { credentials } from "db:schema";
import { eq } from "drizzle-orm";
import { type Password, orm } from "edgekitjs";

export class CredentialsRepository {
	async create(
		input: Pick<typeof credentials.$inferInsert, "userId" | "passwordHash">,
	) {
		let [credential] = await orm()
			.insert(credentials)
			.values(input)
			.returning();

		if (credential) return Credential.from(credential);
		throw new Error("Failed to create user credential");
	}

	async findByUser(user: User) {
		let list = await orm()
			.select()
			.from(credentials)
			.where(eq(credentials.userId, user.id))
			.limit(1)
			.execute();

		return Credential.fromMany(list);
	}

	async upsertByUser(user: User, password: Password) {
		let passwordHash = await password.hash();
		await orm()
			.insert(credentials)
			.values({ userId: user.id, passwordHash })
			.onConflictDoUpdate({
				target: credentials.userId,
				set: { passwordHash },
			});
	}
}
