import { integer } from "drizzle-orm/sqlite-core";

export function timestamp<Name extends string>(name: Name) {
	return integer(name, { mode: "timestamp_ms" });
}

export const createdAt = timestamp("created_at")
	.notNull()
	.$defaultFn(() => new Date());

export const updatedAt = timestamp("updated_at")
	.notNull()
	.$defaultFn(() => new Date());
