import { Repository } from "app:core/repository";
import { Session } from "app:entities/session";
import type { User } from "app:entities/user";
import type { IPAddress } from "app:lib/ip-address";
import { UserAgent } from "app:lib/user-agent";
import schema from "db:schema";
import { eq } from "drizzle-orm";

export class SessionsRepository extends Repository {
	async findById(id: Session["id"]) {
		return Session.fromMany(
			await this.db
				.select()
				.from(schema.sessions)
				.where(eq(schema.sessions.id, id))
				.limit(1)
				.execute(),
		);
	}

	async create({ user, ip, ua, payload }: SessionsRepository.CreateInput) {
		let [session] = await this.db
			.insert(schema.sessions)
			.values({
				userId: user.id,
				ipAddress: ip?.toString(),
				userAgent: ua?.toString(),
				payload,
				lastActivityAt: new Date(),
			})
			.returning();

		if (session) return Session.from(session);
		throw new Error("Failed to create session");
	}

	async destroy(id: Session["id"]) {
		await this.db
			.delete(schema.sessions)
			.where(eq(schema.sessions.id, id))
			.execute();
	}
}

export namespace SessionsRepository {
	export interface CreateInput {
		user: User;
		ip?: IPAddress | null;
		ua?: UserAgent | null;
		payload: Record<string, unknown>;
	}
}
