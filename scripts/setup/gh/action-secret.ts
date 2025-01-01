import { Data } from "@edgefirst-dev/data";
import type { ObjectParser } from "@edgefirst-dev/data/parser";
import type { Octokit } from "@octokit/core";
import sodium from "libsodium-wrappers";

export class ActionSecret extends Data<ObjectParser> {
	static async create(
		gh: Octokit,
		owner: string,
		repo: string,
		name: string,
		value: string,
	) {
		let data = await ActionSecret.encrypt(gh, owner, repo, value);

		await gh.request("PUT /repos/{owner}/{repo}/actions/secrets/{name}", {
			owner,
			repo,
			name,
			data,
		});
	}

	private static async encrypt(
		gh: Octokit,
		owner: string,
		repo: string,
		value: string,
	) {
		let {
			data: { key, key_id },
		} = await gh.request(
			"GET /repos/{owner}/{repo}/actions/secrets/public-key",
			{ owner, repo },
		);

		await sodium.ready;
		let binPublicKey = sodium.from_base64(key, sodium.base64_variants.ORIGINAL);
		let binSecret = sodium.from_string(value);
		let encrypted = sodium.crypto_box_seal(binSecret, binPublicKey);
		let encrypted_value = sodium.to_base64(
			encrypted,
			sodium.base64_variants.ORIGINAL,
		);

		return { key_id, encrypted_value };
	}
}
