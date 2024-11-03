import { SessionsRepository } from "app:repositories.server/sessions";
import { Task } from "edgekitjs";

export class CleanupSessionsTask extends Task {
	private sessions = new SessionsRepository();

	override async perform(): Promise<void> {
		let expiredSessions = await this.sessions.findExpired();
		console.info(`Found ${expiredSessions.length} expired sessions`);
		await Promise.all(expiredSessions.map((s) => this.sessions.destroy(s.id)));
	}
}
