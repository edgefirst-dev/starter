import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import type { Cloudflare } from "cloudflare";
import consola from "consola";
import type { Account } from "./account";

export class Queue extends Data<ObjectParser> {
	get id() {
		return this.parser.string("queue_id");
	}

	get name() {
		return this.parser.string("queue_name");
	}

	static async create(cf: Cloudflare, account: Account, name: string) {
		consola.info(`Creating queue ${name}.`);

		let result = await cf.queues.create({
			account_id: account.id,
			queue_name: name,
		});

		let queue = new Queue(new ObjectParser(result));

		consola.success(`Created queue ${queue.name}.`);

		return queue;
	}

	static async find(cf: Cloudflare, account: Account, name: string) {
		consola.info(`Looking up for queue named ${name}...`);

		let { result } = await cf.queues.list({ account_id: account.id });

		let queues = result
			.map((r) => new Queue(new ObjectParser(r)))
			.filter((queue) => queue.name === name);

		if (queues.length === 0) {
			consola.info(`No queue found named ${name}.`);
			return null;
		}

		if (queues.length > 1) {
			throw new Error(`Found more than one queue named ${name}.`);
		}

		return queues.at(0) ?? null;
	}

	static async upsert(cf: Cloudflare, account: Account, projectName: string) {
		let name = Queue.getName(projectName);

		let r2 = await Queue.find(cf, account, name);

		if (r2) {
			consola.success(`Using found queue ${name}.`);
			return r2;
		}

		return await Queue.create(cf, account, name);
	}

	static async delete(cf: Cloudflare, account: Account, projectName: string) {
		let name = Queue.getName(projectName);

		consola.info(`Deleting queue ${name} if exists.`);

		let queue = await Queue.find(cf, account, name);

		if (!queue) return null;

		await cf.queues.delete(queue.id, { account_id: account.id });

		consola.success(`Deleted queue ${name}.`);
	}

	private static getName(projectName: string) {
		return `${projectName}-queue`;
	}
}
