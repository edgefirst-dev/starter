import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import type { Octokit } from "@octokit/core";
import consola from "consola";

export class Repository extends Data<ObjectParser> {
	get owner() {
		return this.parser.string("owner.login");
	}

	get name() {
		return this.parser.string("name");
	}

	get fullName() {
		return this.parser.string("full_name");
	}

	get url() {
		return new URL(this.parser.string("html_url"));
	}

	static async create(gh: Octokit, owner: string, repo: string) {
		consola.info(`Creating repository ${owner}/${repo}`);
		let result = await gh.request("POST /orgs/{org}/repos", {
			name: repo,
			org: owner,
			private: true,
		});
		consola.success(`Created repository ${owner}/${repo}`);
		return new Repository(new ObjectParser(result.data));
	}

	static async find(gh: Octokit, owner: string, repo: string) {
		consola.info(`Looking up for repository ${owner}/${repo}...`);

		let { data } = await gh.request("GET /repos/{owner}/{repo}", {
			owner,
			repo,
		});

		if (!data) {
			consola.info(`No repository found with the name ${owner}/${repo}.`);
			return null;
		}

		return new Repository(new ObjectParser(data));
	}

	static async upsert(gh: Octokit, owner: string, repo: string) {
		let repository = await Repository.find(gh, owner, repo);

		if (repository) {
			consola.success(`Using found repository ${owner}/${repo}.`);
			return repository;
		}

		return Repository.create(gh, owner, repo);
	}
}
