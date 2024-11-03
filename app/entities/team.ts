import { TableEntity } from "edgekitjs";

export class Team extends TableEntity {
	get name() {
		return this.parser.string("name");
	}
}
