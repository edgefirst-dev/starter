import { TableEntity } from "app:core/entity";
import { StringParser } from "app:lib/string-parser";

export class Session extends TableEntity {
	get userId() {
		return new StringParser(this.parser.string("userId")).cuid();
	}

	get ip() {
		if (this.parser.isNull("ipAddress")) return null;
		return new StringParser(this.parser.string("ipAddress")).ip();
	}

	get ua() {
		if (this.parser.isNull("userAgent")) return null;
		return new StringParser(this.parser.string("userAgent")).userAgent();
	}

	get lastActivityAt() {
		return this.parser.date("lastActivityAt");
	}

	get payload() {
		return this.parser.object("payload");
	}

	get teamId() {
		return new StringParser(this.payload.string("teamId")).cuid();
	}

	get teams() {
		return this.payload
			.array("teams")
			.map((team: string) => new StringParser(team).cuid());
	}
}
