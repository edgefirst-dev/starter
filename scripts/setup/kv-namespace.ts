import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import type { Cloudflare } from "cloudflare";
import consola from "consola";
import type { Account } from "./account";

export class KVNamespace extends Data<ObjectParser> {
	get id() {
		return this.parser.string("id");
	}

	get name() {
		return this.parser.string("title");
	}

	static async create(cf: Cloudflare, account: Account, title: string) {
		consola.info("Creating KV namespace...");

		let result = await cf.kv.namespaces.create({
			account_id: account.id,
			title,
		});

		let kv = new KVNamespace(new ObjectParser(result));

		consola.success(`Created KV namespace ${kv.name}.`);

		return kv;
	}

	static async find(cf: Cloudflare, account: Account, name: string) {
		consola.info(`Looking up for KV namespace named ${name}...`);

		let { result } = await cf.kv.namespaces.list({ account_id: account.id });

		let kvNamespaces = result
			.map((r) => new KVNamespace(new ObjectParser(r)))
			.filter((kv) => kv.name === name);

		if (kvNamespaces.length === 0) {
			consola.info(`No KV namespace found with the name ${name}.`);
			return null;
		}

		if (kvNamespaces.length > 1) {
			throw new Error(`Found more than one KV namespace named ${name}.`);
		}

		return kvNamespaces.at(0) ?? null;
	}

	static async upsert(cf: Cloudflare, account: Account, projectName: string) {
		let name = KVNamespace.getName(projectName);

		let kv = await KVNamespace.find(cf, account, name);

		if (kv) {
			consola.success(`Using found KV namespace ${name}.`);
			return kv;
		}

		return await KVNamespace.create(cf, account, name);
	}

	static async delete(cf: Cloudflare, account: Account, projectName: string) {
		let name = KVNamespace.getName(projectName);

		consola.info(`Deleting KV namespace ${name} if exists.`);

		let kv = await KVNamespace.find(cf, account, name);

		if (!kv) return null;

		await cf.kv.namespaces.delete(kv.id, { account_id: account.id });

		consola.success(`Deleted KV namespace ${name}.`);
	}

	private static getName(projectName: string) {
		return `${projectName}-kv`;
	}
}
