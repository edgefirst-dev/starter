import { User } from "app:entities/user";
import schema from "db:schema";
import { orm } from "@edgefirst-dev/core";
import { count, eq } from "drizzle-orm";

export class UsersRepository {
	async findAll() {
		return User.fromMany(await orm().select().from(schema.users).execute());
	}

	async findById(id: User["id"]) {
		return User.fromMany(
			await orm()
				.select()
				.from(schema.users)
				.where(eq(schema.users.id, id))
				.limit(1)
				.execute(),
		);
	}

	async findByEmail(email: User["email"]) {
		return User.fromMany(
			await orm()
				.select()
				.from(schema.users)
				.where(eq(schema.users.email, email.toString()))
				.limit(1)
				.execute(),
		);
	}

	async create(input: Omit<typeof schema.users.$inferInsert, "id">) {
		let [user] = await orm().insert(schema.users).values(input).returning();
		if (user) return User.from(user);
		throw new Error("Failed to create user");
	}

	async update(
		id: User["id"],
		input: Partial<typeof schema.users.$inferInsert>,
	) {
		await orm()
			.update(schema.users)
			.set(input)
			.where(eq(schema.users.id, id))
			.execute();
	}

	async verifyEmail(user: User) {
		await orm()
			.update(schema.users)
			.set({ emailVerifiedAt: new Date() })
			.where(eq(schema.users.id, user.id))
			.execute();
	}

	async count() {
		let [result] = await orm()
			.select({ count: count() })
			.from(schema.users)
			.execute();
		return result?.count ?? 0;
	}
}
