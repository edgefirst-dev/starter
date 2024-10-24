import { Repository } from "app:core/repository";
import { User } from "app:entities/user";
import schema from "db:schema";
import { eq } from "drizzle-orm";

export class UsersRepository extends Repository {
	async findAll() {
		return User.fromMany(await this.db.select().from(schema.users).execute());
	}

	async findById(id: User["id"]) {
		return User.fromMany(
			await this.db
				.select()
				.from(schema.users)
				.where(eq(schema.users.id, id))
				.limit(1)
				.execute(),
		);
	}

	async findByEmail(email: User["email"]) {
		return User.fromMany(
			await this.db
				.select()
				.from(schema.users)
				.where(eq(schema.users.email, email.toString()))
				.limit(1)
				.execute(),
		);
	}

	async create(input: Omit<typeof schema.users.$inferInsert, "id">) {
		let [user] = await this.db.insert(schema.users).values(input).returning();
		if (user) return User.from(user);
		throw new Error("Failed to create user");
	}

	async update(
		id: User["id"],
		input: Partial<typeof schema.users.$inferInsert>,
	) {
		await this.db
			.update(schema.users)
			.set(input)
			.where(eq(schema.users.id, id))
			.execute();
	}

	async verifyEmail(user: User) {
		await this.db
			.update(schema.users)
			.set({ emailVerifiedAt: new Date() })
			.where(eq(schema.users.id, user.id))
			.execute();
	}
}
