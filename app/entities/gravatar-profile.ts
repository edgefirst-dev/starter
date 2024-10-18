import { Entity } from "app:core/entity";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import { Email } from "@edgefirst-dev/email";

export class GravatarProfile extends Entity {
	constructor(parser: ObjectParser) {
		// The response from Gravatar is an object with an `entry` key, this key
		// is an array with one element, this element is an object with the
		// profile information.
		super(new ObjectParser(parser.array("entry").at(0)));
	}

	get displayName() {
		return this.parser.string("displayName");
	}

	get pronouns() {
		return this.parser.string("pronouns");
	}

	get about() {
		return this.parser.string("aboutMe");
	}

	get jobTitle() {
		return this.parser.string("job_title");
	}

	get company() {
		return this.parser.string("company");
	}

	get location() {
		return this.parser.string("currentLocation");
	}

	get emails() {
		return this.parser
			.array("emails")
			.map((email) => Email.from(new ObjectParser(email).string("value")));
	}

	get primaryEmail() {
		let email = this.parser
			.array("emails")
			.map((email) => new ObjectParser(email))
			.find((parser) => parser.string("primary") === "true")
			?.string("value");
		if (!email) return null;
		return Email.from(email);
	}
}
