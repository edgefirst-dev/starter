import { createId } from "@paralleldrive/cuid2";
import { text } from "drizzle-orm/sqlite-core";

export const ID_LENGTH = 24;

export function cuid<Name extends string>(name: Name, indexName?: string) {
	return text(name, { mode: "text", length: ID_LENGTH })
		.unique(indexName)
		.notNull()
		.$defaultFn(() => createId());
}
