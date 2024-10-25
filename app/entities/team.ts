import { TableEntity } from "@edgefirst-dev/core";

export class Team extends TableEntity {
	get name() {
		return this.parser.string("name");
	}
}
