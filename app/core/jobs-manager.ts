import type { Jobs } from "app:core/job";
import type { Message } from "@cloudflare/workers-types";
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";

class JobsManager {
	#jobs = new Map<string, Jobs<Data>>();

	register<T extends Jobs<Data>>(job: T): void {
		this.#jobs.set(job.constructor.name, job);
	}

	async handle(message: Message): Promise<void> {
		try {
			let body = new ObjectParser(message.body);
			let jobName = body.string("job");
			let job = this.#jobs.get(jobName);
			if (!job) throw new Error(`Job ${jobName} not registered`);
			let input = await job.validate(body);
			await job.handle(input);
			message.ack();
		} catch (error) {
			console.error(error);
			message.retry();
		}
	}
}

export type { JobsManager };
export default new JobsManager();
