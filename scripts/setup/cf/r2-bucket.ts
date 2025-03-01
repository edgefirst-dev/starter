import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import type { Cloudflare } from "cloudflare";
import consola from "consola";
import type { Account } from "./account";

export class R2Bucket extends Data<ObjectParser> {
	get name() {
		return this.parser.string("name");
	}

	static async create(cf: Cloudflare, account: Account, name: string) {
		consola.info(`Creating R2 bucket ${name}.`);

		let result = await cf.r2.buckets.create({ account_id: account.id, name });

		let r2 = new R2Bucket(new ObjectParser(result));

		consola.success(`Created R2 bucket ${r2.name}.`);

		return r2;
	}

	static async find(cf: Cloudflare, account: Account, name: string) {
		consola.info(`Looking up for R2 bucket named ${name}...`);

		let { buckets } = await cf.r2.buckets.list({ account_id: account.id });

		if (!buckets) {
			consola.info(`No R2 bucket found named ${name}.`);
			return null;
		}

		let r2Buckets = buckets
			.map((r: object) => new R2Bucket(new ObjectParser(r)))
			.filter((r2: R2Bucket) => r2.name === name);

		if (r2Buckets.length === 0) {
			consola.info(`No R2 bucket found named ${name}.`);
			return null;
		}

		if (r2Buckets.length > 1) {
			throw new Error(`Found more than one R2 bucket named ${name}.`);
		}

		return r2Buckets.at(0) ?? null;
	}

	static async upsert(cf: Cloudflare, account: Account, projectName: string) {
		let name = R2Bucket.getName(projectName);

		let r2 = await R2Bucket.find(cf, account, name);

		if (r2) {
			consola.success(`Using found R2 bucket ${name}.`);
			return r2;
		}

		return await R2Bucket.create(cf, account, name);
	}

	static async delete(cf: Cloudflare, account: Account, projectName: string) {
		let name = R2Bucket.getName(projectName);

		consola.info(`Deleting R2 bucket ${name} if exists.`);

		let r2 = await R2Bucket.find(cf, account, name);

		if (!r2) return null;

		await cf.r2.buckets.delete(r2.name, { account_id: account.id });

		consola.success(`Deleted R2 bucket ${name}.`);
	}

	private static getName(projectName: string) {
		return `${projectName}-bucket`;
	}
}
