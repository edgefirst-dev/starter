import type { Request } from "@cloudflare/workers-types";
import * as Bowser from "bowser";

export class UserAgent {
	#parsed: Bowser.Parser.ParsedResult;

	constructor(private value: string) {
		this.#parsed = Bowser.parse(this.value);
	}

	static from(value: string | UserAgent): UserAgent {
		if (value instanceof UserAgent) return new UserAgent(value.toString());
		return new UserAgent(value);
	}

	static fromRequest(request: Request): UserAgent | null {
		let header = request.headers.get("user-agent");
		if (!header) return null;
		return UserAgent.from(header);
	}

	get browser() {
		return this.#parsed.browser;
	}

	get engine() {
		return this.#parsed.engine;
	}

	get os() {
		return this.#parsed.os;
	}

	get platform() {
		return this.#parsed.platform;
	}

	toString(): string {
		return this.value;
	}
}
