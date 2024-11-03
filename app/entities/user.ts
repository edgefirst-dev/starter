import { Email } from "edgekitjs";
import { StringParser, TableEntity } from "edgekitjs";

export class User extends TableEntity {
	get email() {
		return Email.from(this.parser.string("email"));
	}

	get emailVerifiedAt() {
		if (this.parser.isNull("emailVerifiedAt")) return null;
		let date = this.parser.date("emailVerifiedAt");
		if (date.toString() === "Invalid Date") return null;
		return date;
	}

	get hasEmailVerified() {
		return this.emailVerifiedAt !== null;
	}

	get displayName() {
		// If there's no display name, let's use the first part of the email address
		if (this.parser.isNull("displayName")) return this.email.username;
		return this.parser.string("displayName");
	}

	get avatar() {
		if (this.parser.isNull("avatarKey")) {
			// If the user has no uploaded avatar, we can use Gravatar to find one
			return `https://gravatar.com/avatar/${this.email.hash}`;
		}

		return `/api/files/${this.parser.string("avatarKey")}`;
	}

	get role() {
		return new StringParser(this.parser.string("role")).enum("user", "root");
	}

	get isRoot() {
		return this.role === "root";
	}
}
