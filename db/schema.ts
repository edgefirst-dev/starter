import { relations } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ID_LENGTH, cuid } from "./helpers/id";
import { createdAt, timestamp, updatedAt } from "./helpers/timestamp";

/**
 * This table is where the application will store the data related to each user
 * of the application.
 */
export const users = sqliteTable(
	"users",
	{
		id: cuid("id", "users_id_unique"),
		// Timestamps
		createdAt,
		updatedAt,
		emailVerifiedAt: timestamp("email_verified_at"),
		// Attributes
		displayName: text("display_name", { mode: "text" }),
		email: text("email", { mode: "text" }).unique().notNull(),
		avatarKey: text("avatar_key", { mode: "text", length: ID_LENGTH }),
		role: text("role", { mode: "text", enum: ["user", "root"] }).default(
			"user",
		),
		emailVerificationToken: cuid(
			"email_verification_token",
			"users_email_verification_token_unique",
		),
	},
	(table) => {
		return {
			emailIndex: index("users_email_idx").on(table.email),
		};
	},
);

export const permissions = sqliteTable("permissions", {
	id: cuid("id", "permissions_id_unique"),
	// Timestamps
	createdAt,
	updatedAt,
	// Attributes
	action: text("action", {
		mode: "text",
		enum: ["create", "read", "update", "delete"],
	}).notNull(),
	entity: text("entity", { mode: "text" }).notNull(),
	access: text("access", { mode: "text", enum: ["own", "any"] }).notNull(),
	description: text("description", { mode: "text" }),
});

export const roles = sqliteTable("roles", {
	id: cuid("id", "roles_id_unique"),
	// Timestamps
	createdAt,
	updatedAt,
	// Attributes
	name: text("name", { mode: "text" }).notNull(),
	description: text("description", { mode: "text" }),
});

export const rolePermissions = sqliteTable(
	"role_permissions",
	{
		id: cuid("id", "role_permissions_id_unique"),
		// Timestamps
		createdAt,
		updatedAt,
		// Relationships
		roleId: text("role_id", { mode: "text" })
			.notNull()
			.references(() => roles.id, { onDelete: "cascade" }),
		permissionId: text("permission_id", { mode: "text" })
			.notNull()
			.references(() => permissions.id, { onDelete: "cascade" }),
	},
	(t) => {
		return {
			roleIndex: index("role_permissions_role_id_idx").on(t.roleId),
			permissionIndex: index("role_permissions_permission_id_idx").on(
				t.permissionId,
			),
			rolePermissionIndex: index("role_permissions_role_permission_idx").on(
				t.roleId,
				t.permissionId,
			),
		};
	},
);

export const audits = sqliteTable(
	"audit_logs",
	{
		id: cuid("id", "audit_logs_id_unique"),
		// Timestamps
		createdAt,
		// Attributes
		action: text("action", { mode: "text" }),
		auditable: text("auditable", { mode: "text" }),
		payload: text("payload", { mode: "json" }).default(JSON.stringify({})),
		// Relationships
		userId: text("user_id", { mode: "text" })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(t) => {
		return {
			userIndex: index("audit_logs_user_id_idx").on(t.userId),
		};
	},
);

export const teams = sqliteTable("teams", {
	id: cuid("id", "teams_id_unique"),
	// Timestamps
	createdAt,
	updatedAt,
	// Attributes
	name: text("name", { mode: "text" }),
});

export const memberships = sqliteTable(
	"memberships",
	{
		id: cuid("id", "memberships_id_unique"),
		// Timestamps
		createdAt,
		updatedAt,
		acceptedAt: timestamp("accepted_at"),
		// Attributes
		role: text("role", { mode: "text", enum: ["member", "owner"] })
			.notNull()
			.default("member"),
		// Relationships
		userId: text("user_id", { mode: "text" })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		teamId: text("team_id", { mode: "text" })
			.notNull()
			.references(() => teams.id, { onDelete: "cascade" }),
	},
	(t) => {
		return {
			userIndex: index("memberships_user_id_idx").on(t.userId),
			userTeamIndex: index("memberships_user_team_idx").on(t.userId, t.teamId),
			teamIndex: index("memberships_team_id_idx").on(t.teamId),
			teamUserIndex: index("memberships_team_user_idx").on(t.teamId, t.userId),
		};
	},
);

export const credentials = sqliteTable(
	"users_credentials",
	{
		id: cuid("id", "users_credentials_id_unique"),
		// Timestamps
		createdAt,
		updatedAt,
		// Attributes
		passwordHash: text("password_hash", { mode: "text" }).notNull(),
		resetToken: text("reset_token", { mode: "text" }).unique(),
		// Relationships
		userId: text("user_id", { mode: "text" })
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(t) => {
		return {
			userIdIndex: index("users_credentials_user_id_idx").on(t.userId),
			resetTokenIndex: index("users_credentials_reset_token_idx").on(
				t.resetToken,
			),
		};
	},
);

export const sessions = sqliteTable("sessions", {
	id: cuid("id", "sessions_id_unique"),
	// Timestamps
	createdAt,
	updatedAt,
	expiresAt: timestamp("expires_at").notNull(),
	lastActivityAt: timestamp("last_activity_at"),
	// Attributes
	userAgent: text("user_agent", { mode: "text" }),
	ipAddress: text("ip_address", { mode: "text" }),
	payload: text("payload", { mode: "json" }).default(JSON.stringify({})),
	// Relationships
	userId: text("user_id", { mode: "text" })
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const usersRelations = relations(users, ({ many, one }) => {
	return {
		audits: many(audits),
		memberships: many(memberships),
		credentials: one(credentials),
		sessions: many(sessions),
	};
});

export const teamsRelations = relations(teams, ({ many }) => {
	return {
		memberships: many(memberships),
	};
});

export const membershipsRelations = relations(memberships, ({ one }) => {
	return {
		user: one(users, {
			fields: [memberships.userId],
			references: [users.id],
		}),
		team: one(teams, {
			fields: [memberships.teamId],
			references: [teams.id],
		}),
	};
});

export const credentialsRelations = relations(credentials, ({ one }) => {
	return {
		user: one(users, {
			fields: [credentials.userId],
			references: [users.id],
		}),
	};
});

export const sessionsRelations = relations(sessions, ({ one }) => {
	return {
		user: one(users, {
			fields: [sessions.userId],
			references: [users.id],
		}),
	};
});

export default {
	users,
	audits,
	teams,
	memberships,
	credentials,
	sessions,
	usersRelations,
	teamsRelations,
	membershipsRelations,
	credentialsRelations,
	sessionsRelations,
};
