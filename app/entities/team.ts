import { TableEntity } from "~/core/entity";

export class Team extends TableEntity {
	get name() {
		return this.parser.string("name");
	}
}
