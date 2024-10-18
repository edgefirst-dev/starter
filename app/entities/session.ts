import { Entity } from "app:core/entity";
import { StringParser } from "app:lib/string-parser";

export class Session extends Entity {
	get userId() {
		return new StringParser(this.parser.string("userId")).cuid();
	}

	get teamId() {
		return new StringParser(this.parser.string("teamId")).cuid();
	}

	get teams() {
		return this.parser
			.array("teams")
			.map((team: string) => new StringParser(team).cuid());
	}
}
