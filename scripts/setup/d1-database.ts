import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import type { Cloudflare } from "cloudflare";
import consola from "consola";
import type { Account } from "./account";

export class Database extends Data<ObjectParser> {
	get id() {
		return this.parser.string("uuid");
	}

	get name() {
		return this.parser.string("name");
	}

	static async create(cf: Cloudflare, account: Account, name: string) {
		consola.info(`Creating D1 database ${name}.`);

		let result = await cf.d1.database.create({
			account_id: account.id,
			name,
		});
		let db = new Database(new ObjectParser(result));

		consola.success(`Created D1 database ${db.name}.`);

		return db;
	}

	static async find(cf: Cloudflare, account: Account, name: string) {
		consola.info(`Looking up for D1 database named ${name}...`);

		let { result } = await cf.d1.database.list({
			account_id: account.id,
			name: name,
		});

		if (result.length === 0) {
			consola.info(`No D1 database found named ${name}.`);
			return null;
		}

		if (result.length > 1) {
			throw new Error(`Found more than one database named ${name}.`);
		}

		return new Database(new ObjectParser(result[0]));
	}

	static async upsert(cf: Cloudflare, account: Account, projectName: string) {
		let name = Database.getName(projectName);

		let db = await Database.find(cf, account, name);
		if (db) {
			consola.success(`Using found D1 database ${name}.`);
			return db;
		}

		return await Database.create(cf, account, name);
	}

	static async delete(cf: Cloudflare, account: Account, projectName: string) {
		let name = Database.getName(projectName);

		consola.info(`Deleting D1 database ${name} if exists.`);

		let db = await Database.find(cf, account, name);
		if (!db) return null;

		await cf.d1.database.delete(db.id, { account_id: account.id });

		consola.success(`Deleted D1 database ${name}.`);
	}

	private static getName(projectName: string) {
		return `${projectName}-db`;
	}
}
