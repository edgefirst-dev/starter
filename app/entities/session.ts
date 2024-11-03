import { StringParser, TableEntity } from "edgekitjs";

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

	get expiresAt() {
		return this.parser.date("expiresAt");
	}

	get hasExpired() {
		return this.expiresAt < new Date();
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

	get geo() {
		if (!this.payload.has("geo")) return null;
		let geo = this.payload.object("geo");
		return { city: geo.string("city"), country: geo.string("country") };
	}
}
