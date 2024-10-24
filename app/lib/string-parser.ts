import { Parser } from "@edgefirst-dev/data/parser";
import { isCuid } from "@paralleldrive/cuid2";

import { Email } from "@edgefirst-dev/email";
import { IPAddress } from "./ip-address";
import { UserAgent } from "./user-agent";

export type CUID = string & { __cuid: true };

export class StringParser extends Parser<string> {
	enum<Value extends string>(...values: Value[]): Value {
		if (values.includes(this.value as Value)) return this.value as Value;
		throw new Error(
			`Expected one of ${values.join(", ")}, but got ${this.value}`,
		);
	}

	email(): Email {
		if (Email.canParse(this.value)) return Email.from(this.value);
		throw new Error(`Expected a valid email, but got ${this.value}`);
	}

	url(): URL {
		try {
			return new URL(this.value);
		} catch {
			throw new Error(`Expected a valid URL, but got ${this.value}`);
		}
	}

	datetime() {
		let date = new Date(this.value);
		if (date.toString() === "Invalid Date") {
			throw new Error(`Expected a valid date, but got ${this.value}`);
		}
		return date;
	}

	ip() {
		if (IPAddress.canParse(this.value)) return IPAddress.from(this.value);
		throw new Error(`Expected a valid IP address, but got ${this.value}`);
	}

	cuid() {
		if (isCuid(this.value)) return this.value as CUID;
		throw new Error(`Expected a valid CUID, but got ${this.value}`);
	}

	wordCount() {
		return this.value.split(/\s+/).length;
	}

	userAgent() {
		if (UserAgent.canParse(this.value)) return UserAgent.from(this.value);
		throw new Error(`Expected a valid user agent, but got ${this.value}`);
	}
}
