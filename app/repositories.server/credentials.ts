import { Repository } from "app:core/repository";
import { Credential } from "app:entities/credential";
import type { User } from "app:entities/user";
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

	async findByUser(user: User) {
		let list = await this.db
			.select()
			.from(credentials)
			.where(eq(credentials.userId, user.id))
			.limit(1)
			.execute();

		return Credential.fromMany(list);
	}

	async createResetToken(credential: Credential, token: string) {
		await this.db
			.update(credentials)
			.set({ resetToken: token })
			.where(eq(credentials.id, credential.id))
			.execute();
	}

	async revokeResetToken(credential: Credential) {
		await this.db
			.update(credentials)
			.set({ resetToken: null })
			.where(eq(credentials.id, credential.id))
			.execute();
	}
}
