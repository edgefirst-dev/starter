import { StringParser, TableEntity } from "@edgefirst-dev/core";

export class Membership extends TableEntity {
	get teamId() {
		return new StringParser(this.parser.string("teamId")).cuid();
	}

	get userId() {
		return new StringParser(this.parser.string("userId")).cuid();
	}

	get acceptedAt() {
		if (this.parser.isNull("acceptedAt")) return null;
		let date = this.parser.date("acceptedAt");
		if (date.toString() === "Invalid Date") return null;
		return date;
	}

	get role() {
		return new StringParser(this.parser.string("role")).enum("member", "admin");
	}

	get isMember() {
		return this.role === "member";
	}

	get isAdmin() {
		return this.role === "admin";
	}
}
