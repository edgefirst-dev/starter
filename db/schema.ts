import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ID_LENGTH, cuid } from "./helpers/id";
import { createdAt, timestamp, updatedAt } from "./helpers/timestamp";

/**
 * This table is where the application will store the data related to each user
 * of the application.
 */
export const users = sqliteTable("users", {
  id: cuid("id", "users_id_unique"),
  // Timestamps
  createdAt,
  updatedAt,
  emailVerifiedAt: timestamp("email_verified_at"),
  // Attributes
  displayName: text("display_name", { mode: "text" }),
  email: text("email", { mode: "text" }),
  avatarKey: text("avatar_key", { mode: "text", length: ID_LENGTH }),
});

export const teams = sqliteTable("teams", {
  id: cuid("id", "teams_id_unique"),
  // Timestamps
  createdAt,
  updatedAt,
  // Attributes
  name: text("name", { mode: "text" }),
});

export const memberships = sqliteTable("memberships", {
  id: cuid("id", "memberships_id_unique"),
  // Timestamps
  createdAt,
  updatedAt,
  // Relationships
  userId: text("user_id", { mode: "text" })
    .notNull()
    .references(() => users.id),
  teamId: text("team_id", { mode: "text" })
    .notNull()
    .references(() => teams.id),
});

export const credentials = sqliteTable("users_credentials", {
  id: cuid("id", "users_credentials_id_unique"),
  // Timestamps
  createdAt,
  updatedAt,
  // Attributes
  passwordHash: text("password_hash", { mode: "text" }).notNull(),
  // Relationships
  userId: text("user_id", { mode: "text" })
    .notNull()
    .references(() => users.id),
});

export default { users, teams, memberships, credentials };
