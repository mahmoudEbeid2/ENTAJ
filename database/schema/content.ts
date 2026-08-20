import { boolean, index, int, mysqlEnum, mysqlTable, unique, varchar } from "drizzle-orm/mysql-core";
import { softDelete, timestamps } from "./common";

export const divisions = mysqlTable("divisions", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 100 }),
  subtitle: varchar("subtitle", { length: 255 }),
  numeral: varchar("numeral", { length: 20 }),
  description: varchar("description", { length: 1000 }),
  imagePath: varchar("image_path", { length: 500 }),
  ctaLabel: varchar("cta_label", { length: 100 }).default("GO TO PRODUCTS"),
  sortOrder: int("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
  ...softDelete,
});

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    divisionId: int("division_id")
      .notNull()
      .references(() => divisions.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    recommendedLabel: varchar("recommended_label", { length: 100 }),
    spec: varchar("spec", { length: 255 }),
    description: varchar("description", { length: 500 }),
    imagePath: varchar("image_path", { length: 500 }),
    isRecommended: boolean("is_recommended").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: int("sort_order").notNull().default(0),
    recommendedSortOrder: int("recommended_sort_order"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index("products_division_id_idx").on(t.divisionId),
    index("products_is_recommended_idx").on(t.isRecommended),
  ],
);

export const PRODUCT_DOCUMENT_TYPES = ["msds", "coa"] as const;
export type ProductDocumentType = (typeof PRODUCT_DOCUMENT_TYPES)[number];

export const productDocuments = mysqlTable(
  "product_documents",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    type: mysqlEnum("type", PRODUCT_DOCUMENT_TYPES).notNull(),
    filePath: varchar("file_path", { length: 500 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileSizeBytes: int("file_size_bytes").notNull(),
    ...timestamps,
  },
  (t) => [
    index("product_documents_product_id_idx").on(t.productId),
    unique("product_documents_product_type_unique").on(t.productId, t.type),
  ],
);
