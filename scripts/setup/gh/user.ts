import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import type { Octokit } from "@octokit/core";

export class User extends Data<ObjectParser> {
	get login() {
		return this.parser.string("login");
	}

	static async viewer(gh: Octokit) {
		let { data } = await gh.request("GET /user");
		return new User(new ObjectParser(data));
	}
}
