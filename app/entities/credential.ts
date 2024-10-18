import { TableEntity } from "app:core/entity";
import type { Password } from "app:lib/password";
import { StringParser } from "app:lib/string-parser";

export class Credential extends TableEntity {
	get userId() {
		return new StringParser(this.parser.string("userId")).cuid();
	}

	get passwordHash() {
		return this.parser.string("passwordHash");
	}

	async match(password: Password) {
		return await password.compare(this.passwordHash);
	}
}
