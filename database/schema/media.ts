import { index, int, mysqlEnum, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { admins } from "./auth";
import { softDelete, timestamps } from "./common";

export const STORAGE_CATEGORIES = [
  "products",
  "categories",
  "blog",
  "services",
  "partners",
  "testimonials",
  "pages",
  "settings",
] as const;

export const mediaLibrary = mysqlTable(
  "media_library",
  {
    id: int("id").autoincrement().primaryKey(),
    diskPath: varchar("disk_path", { length: 500 }).notNull().unique(),
    originalFilename: varchar("original_filename", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    sizeBytes: int("size_bytes").notNull(),
    width: int("width"),
    height: int("height"),
    altText: varchar("alt_text", { length: 255 }),
    category: mysqlEnum("category", STORAGE_CATEGORIES).notNull(),
    uploadedByAdminId: int("uploaded_by_admin_id").references(() => admins.id, {
      onDelete: "set null",
    }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("media_library_category_idx").on(t.category)],
);
