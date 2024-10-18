import { TableEntity } from "app:core/entity";
import { StringParser } from "app:lib/string-parser";

export class Membership extends TableEntity {
	get teamId() {
		return new StringParser(this.parser.string("teamId")).cuid();
	}

	get userId() {
		return new StringParser(this.parser.string("userId")).cuid();
	}
}
