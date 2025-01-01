import * as Path from "node:path";
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { file, write } from "bun";
import type { Repository } from "./gh/repository";

export class Package extends Data<ObjectParser> {
	get name() {
		return this.parser.string("name");
	}

	set name(newName: string) {
		this.parser = new ObjectParser({ ...this.parser.valueOf(), name: newName });
	}

	set repository(repo: Repository) {
		this.parser = new ObjectParser({
			...this.parser.valueOf(),
			repository: { type: "git", url: repo.url },
		});
	}

	get repositoryURL() {
		return new URL(this.parser.object("repository").string("url"));
	}

	static async read() {
		let path = Path.resolve("./package.json");
		return new Package(new ObjectParser(await file(path).json()));
	}

	async write() {
		let path = Path.resolve("./package.json");
		await write(file(path), JSON.stringify(this.parser.valueOf(), null, "\t"));
	}
}
