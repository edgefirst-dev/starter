import { Entity } from "edgekitjs";

export class GravatarProfile extends Entity {
	get displayName() {
		return this.parser.string("display_name");
	}

	get pronouns() {
		return this.parser.string("pronouns");
	}

	get jobTitle() {
		return this.parser.string("job_title");
	}

	get company() {
		return this.parser.string("company");
	}

	get location() {
		return this.parser.string("location");
	}
}
