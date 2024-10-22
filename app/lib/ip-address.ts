import { isIP } from "node:net";
import type { Request } from "@cloudflare/workers-types";

export class IPAddress {
	private value: string;

	private constructor(ip: string | IPAddress) {
		if (ip instanceof IPAddress) {
			this.value = ip.toString();
		} else if (this.isValid(ip)) {
			this.value = ip.trim();
		} else {
			throw new TypeError(`Invalid IP address ${ip}`);
		}
	}

	static from(ip: string | IPAddress) {
		return new IPAddress(ip);
	}

	static fromRequest(request: Request) {
		let header = request.headers.get("CF-Connecting-IP");
		if (!header) return null;
		return IPAddress.from(header);
	}

	static canParse(ip: string | IPAddress) {
		if (ip instanceof IPAddress) return true;
		try {
			IPAddress.from(ip);
			return true;
		} catch {
			return false;
		}
	}

	get version(): 6 | 4 {
		if (isIP(this.value) === 4) return 4;
		if (isIP(this.value) === 6) return 6;
		throw new Error(`Invalid IP address: ${this.value}`);
	}

	get isV4() {
		return this.version === 4;
	}

	get isV6() {
		return this.version === 6;
	}

	private isValid(ip: string) {
		return isIP(ip) !== 0;
	}

	toString() {
		return this.value;
	}

	toJSON() {
		return this.value;
	}

	valueOf() {
		return this.value;
	}
}
