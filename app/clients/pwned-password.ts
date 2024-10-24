import { APIClient } from "@edgefirst-dev/api-client";
import { sha1 } from "@oslojs/crypto/sha1";
import { encodeHexLowerCase } from "@oslojs/encoding";

export class PwnedPasswords extends APIClient {
	constructor() {
		super(new URL("https://api.pwnedpasswords.com"));
	}

	protected override async after(response: Response): Promise<Response> {
		if (response.ok) return response;
		throw new Error(`PwnedPasswords API failed: ${response.statusText}`);
	}

	async isPwned(hash: string) {
		let hashPrefix = hash.slice(0, 5);

		let response = await this.get(`/range/${hashPrefix}`);

		let data = await response.text();
		let items = data.split("\n");

		for (let item of items) {
			let hashSuffix = item.slice(0, 35).toLowerCase();
			if (hash === hashPrefix + hashSuffix) return true;
		}

		return false;
	}

	static hash(value: string) {
		return encodeHexLowerCase(sha1(new TextEncoder().encode(value)));
	}
}
