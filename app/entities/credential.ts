import { Password, StringParser, TableEntity } from "@edgefirst-dev/core";

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
