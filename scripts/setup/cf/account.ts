import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import type { Cloudflare } from "cloudflare";
import consola from "consola";

export class Account extends Data<ObjectParser> {
	get id() {
		return this.parser.string("id");
	}

	get name() {
		return this.parser.string("name");
	}

	static async find(cf: Cloudflare) {
		consola.info("Finding account...");

		let { result } = await cf.accounts.list();

		if (result.length === 0) throw new Error("No account found.");
		if (result.length > 1) throw new Error("Multiple accounts found.");

		let account = new Account(new ObjectParser(result.at(0)));
		consola.success(`Found account ${account.name}.`);

		return account;
	}
}
