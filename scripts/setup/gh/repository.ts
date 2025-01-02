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

	static async create(
		gh: Octokit,
		owner: string,
		repo: string,
		isOrg: boolean,
	) {
		consola.info(`Creating repository ${owner}/${repo}`);

		if (isOrg) {
			consola.debug("Creating repository for organization");
			let result = await gh.request("POST /orgs/{org}/repos", {
				name: repo,
				org: owner,
			});
			consola.success(`Created repository ${owner}/${repo}`);
			return new Repository(new ObjectParser(result.data));
		}

		consola.debug("Creating repository for user");
		let result = await gh.request("POST /user/repos", {
			name: repo,
		});

		consola.success(`Created repository ${owner}/${repo}`);

		return new Repository(new ObjectParser(result.data));
	}

	static async find(gh: Octokit, owner: string, repo: string) {
		consola.info(`Looking up for repository ${owner}/${repo}...`);

		try {
			let { data } = await gh.request("GET /repos/{owner}/{repo}", {
				owner,
				repo,
			});

			return new Repository(new ObjectParser(data));
		} catch {
			consola.info(`No repository found with the name ${owner}/${repo}.`);
			return null;
		}
	}

	static async upsert(
		gh: Octokit,
		owner: string,
		repo: string,
		isOrg: boolean,
	) {
		let repository = await Repository.find(gh, owner, repo);

		if (repository) {
			consola.success(`Using found repository ${owner}/${repo}.`);
			return repository;
		}

		return Repository.create(gh, owner, repo, isOrg);
	}
}
