import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import type { Cloudflare } from "cloudflare";
import consola from "consola";
import { generatePath } from "react-router";
import type { Account } from "./account";

export class Worker extends Data<ObjectParser> {
	get name() {
		return this.parser.string("id");
	}

	static async create(cf: Cloudflare, account: Account, name: string) {
		consola.info(`Creating worker ${name}.`);

		let formData = new FormData();
		formData.set("account_id", account.id);
		formData.set("metadata", JSON.stringify({ main_module: "worker.ts" }));
		formData.set(
			"worker.ts",
			new File(["export default { fetch() {} }"], "worker.ts", {
				type: "application/javascript+module",
			}),
		);

		let path = generatePath(
			"/client/v4/accounts/:accountId/workers/services/:name/environments/staging",
			{ accountId: account.id, name },
		);

		let response = await fetch(new URL(path, "https://api.cloudflare.com"), {
			method: "PUT",
			body: formData,
			headers: { Authorization: `Bearer ${cf.apiToken}` },
		});

		if (!response.ok) throw new Error("Failed to create worker.");

		let result = await response.json();

		let parser = new ObjectParser(result);

		let worker = new Worker(parser.object("result"));

		consola.success(`Created worker ${worker.name}.`);

		return worker;
	}

	static async find(cf: Cloudflare, account: Account, name: string) {
		consola.info(`Looking up for Worker named ${name}...`);

		let { result } = await cf.workers.scripts.list({
			account_id: account.id,
		});

		let workers = result
			.map((item) => new Worker(new ObjectParser(item)))
			.filter((worker) => worker.name === name);

		if (workers.length === 0) {
			consola.info(`No workers found named ${name}.`);
			return null;
		}

		if (workers.length > 1) {
			throw new Error(`Found more than one worker named ${name}.`);
		}

		return workers.at(0) ?? null;
	}

	static async upsert(cf: Cloudflare, account: Account, projectName: string) {
		let worker = await Worker.find(cf, account, projectName);

		if (worker) {
			consola.success(`Using found worker ${projectName}.`);
			return worker;
		}

		return await Worker.create(cf, account, projectName);
	}
}
