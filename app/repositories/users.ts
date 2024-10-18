import { Repository } from "app:core/repository";
import { User } from "app:entities/user";
import { users } from "db:schema";
import { eq } from "drizzle-orm";

export class UsersRepository extends Repository {
	async findAll() {
		return User.fromMany(await this.db.select().from(users).execute());
	}

	async findById(id: User["id"]) {
		return User.fromMany(
			await this.db
				.select()
				.from(users)
				.where(eq(users.id, id))
				.limit(1)
				.execute(),
		);
	}

	async findByEmail(email: User["email"]) {
		return User.fromMany(
			await this.db
				.select()
				.from(users)
				.where(eq(users.email, email.toString()))
				.limit(1)
				.execute(),
		);
	}

	async create(input: Omit<typeof users.$inferInsert, "id">) {
		let [user] = await this.db.insert(users).values(input).returning();
		if (user) return User.from(user);
		throw new Error("Failed to create user");
	}

	async verifyEmail(user: User) {
		await this.db
			.update(users)
			.set({ emailVerifiedAt: new Date() })
			.where(eq(users.id, user.id))
			.execute();
	}
}
