import type { Request } from "@cloudflare/workers-types";
import { type Parser, parse } from "bowser";

export class UserAgent {
	#parsed: Parser.ParsedResult;

	constructor(private value: string) {
		this.#parsed = parse(this.value);
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

	static canParse(value: string) {
		try {
			parse(value);
			return true;
		} catch {
			return false;
		}
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
