import * as Path from "node:path";
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { file, write } from "bun";
import type { Repository } from "./gh/repository";

export class Package extends Data<ObjectParser> {
	set name(name: string) {
		this.parser = new ObjectParser({ ...this.parser.valueOf(), name });
	}

	set description(description: string) {
		this.parser = new ObjectParser({ ...this.parser.valueOf(), description });
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
		let pkg = file(path);

		if (await pkg.exists()) {
			return new Package(new ObjectParser(await pkg.json()));
		}

		throw new Error(
			"Failed to find the package.json file. Ensure you're running the setup script from the root of your project.",
		);
	}

	async write() {
		let path = Path.resolve("./package.json");
		await write(file(path), JSON.stringify(this.parser.valueOf(), null, "\t"));
	}
}
