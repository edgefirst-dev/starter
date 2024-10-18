import { StringParser } from "app:lib/string-parser";
import { Data } from "@edgefirst-dev/data";
import { ObjectParser } from "@edgefirst-dev/data/parser";
import type { Table } from "drizzle-orm";
import { dasherize, underscore } from "inflected";

/**
 * An entity represents a single object in the domain model.
 *
 * Most entities are backed by a database table, but some entities may be
 * transient and not persisted to the database, or may be backed by a different
 * kind of data store.
 */
export abstract class Entity extends Data<ObjectParser> {}

/**
 * A table entity represents a single row in a database table.
 *
 * Table entities are backed by a database table, and are typically used to
 * represent domain objects that are persisted to the database.
 */
export abstract class TableEntity extends Entity {
	static from<T extends Table, M extends TableEntity>(
		this: new (
			parser: ObjectParser,
		) => M,
		data: T["$inferSelect"],
	) {
		// biome-ignore lint/complexity/noThisInStatic: It's ok
		return new this(new ObjectParser(data));
	}

	static fromMany<T extends Table, M extends TableEntity>(
		this: new (
			parser: ObjectParser,
		) => M,
		data: T["$inferSelect"][],
	) {
		// biome-ignore lint/complexity/noThisInStatic: It's ok
		return data.map((datum) => new this(new ObjectParser(datum)));
	}

	get id() {
		return new StringParser(this.parser.string("id")).cuid();
	}

	get createdAt() {
		return this.parser.date("createdAt");
	}

	get updatedAt() {
		return this.parser.date("updatedAt");
	}

	override toString() {
		return `${dasherize(underscore(this.constructor.name))}:${this.id}`;
	}
}
