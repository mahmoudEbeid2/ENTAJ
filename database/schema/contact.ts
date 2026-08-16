import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { divisions } from "./content";
import { softDelete, timestamps } from "./common";

export const offices = mysqlTable("offices", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 150 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  flagIconPath: varchar("flag_icon_path", { length: 500 }),
  isPrimary: boolean("is_primary").notNull().default(false),
  sortOrder: int("sort_order").notNull().default(0),
  ...timestamps,
});

export const contactMessages = mysqlTable(
  "contact_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    fullName: varchar("full_name", { length: 150 }).notNull(),
    company: varchar("company", { length: 150 }),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 255 }).notNull(),
    divisionId: int("division_id").references(() => divisions.id, { onDelete: "set null" }),
    message: varchar("message", { length: 3000 }).notNull(),
    status: mysqlEnum("status", ["new", "read", "archived"]).notNull().default("new"),
    readAt: timestamp("read_at"),
    createdAt: timestamps.createdAt,
    ...softDelete,
  },
  (t) => [
    index("contact_messages_status_idx").on(t.status),
    index("contact_messages_division_id_idx").on(t.divisionId),
  ],
);
