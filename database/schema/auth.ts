import {
  boolean,
  index,
  int,
  json,
  mysqlTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { softDelete, timestamps } from "./common";

export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  ...timestamps,
  ...softDelete,
});

export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  ...timestamps,
});

export const rolePermissions = mysqlTable(
  "role_permissions",
  {
    roleId: int("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: int("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export const admins = mysqlTable(
  "admins",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    roleId: int("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    avatarPath: varchar("avatar_path", { length: 500 }),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at"),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("admins_role_id_idx").on(t.roleId)],
);

export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    adminId: int("admin_id").references(() => admins.id, { onDelete: "set null" }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: int("entity_id"),
    meta: json("meta").$type<Record<string, unknown>>(),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    index("activity_logs_admin_id_idx").on(t.adminId),
    index("activity_logs_entity_idx").on(t.entityType, t.entityId),
  ],
);
