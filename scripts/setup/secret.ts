import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import type Cloudflare from "cloudflare";
import consola from "consola";
import { generatePath } from "react-router";
import type { Account } from "./account";
import { Worker } from "./worker";

export class Secret extends Data<ObjectParser> {
	get name() {
		return this.parser.string("name");
	}

	get type() {
		return this.parser.string("type");
	}

	static async create(
		cf: Cloudflare,
		account: Account,
		worker: Worker,
		name: string,
		text: string,
	) {
		consola.info(`Creating secret ${name}.`);

		let path = generatePath(
			"client/v4/accounts/:accountId/workers/scripts/:workerName/secrets",
			{ accountId: account.id, workerName: worker.name },
		);

		let response = await fetch(new URL(path, "https://api.cloudflare.com"), {
			method: "PUT",
			body: JSON.stringify({ name, text, type: "secret_text" }),
			headers: {
				Authorization: `Bearer ${cf.apiToken}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) throw new Error(`Failed to create secret ${name}.`);

		let result = await response.json();
		let parser = new ObjectParser(result);

		consola.success(`Created secret ${name}.`);

		return new Secret(parser.object("result"));
	}
}
