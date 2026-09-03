import { boolean, index, int, json, mysqlEnum, mysqlTable, primaryKey, unique, varchar } from "drizzle-orm/mysql-core";
import { softDelete, timestamps } from "./common";

export const categories = mysqlTable(
  "divisions",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    shortName: varchar("short_name", { length: 100 }),
    subtitle: varchar("subtitle", { length: 255 }),
    numeral: varchar("numeral", { length: 20 }),
    description: varchar("description", { length: 1000 }),
    imagePath: varchar("image_path", { length: 500 }),
    iconPath: varchar("icon_path", { length: 500 }),
    bgColor: varchar("bg_color", { length: 50 }),
    ctaLabel: varchar("cta_label", { length: 100 }).default("GO TO PRODUCTS"),
    sortOrder: int("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("categories_sort_order_idx").on(t.sortOrder)],
);

export const divisions = categories;


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
    // Structured content fields, distinct from the free-text `spec` field above (which is
    // reused for a short grade label, e.g. "Light / Dense", when one is given).
    formula: varchar("formula", { length: 100 }),
    purity: varchar("purity", { length: 150 }),
    applications: json("applications").$type<string[]>(),
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

// Many-to-many product/division membership, additive to the legacy products.divisionId FK
// (kept as-is for backward compatibility with existing single-division code paths). This
// join table is the source of truth for "which divisions show this product" going forward.
export const productDivisions = mysqlTable(
  "product_divisions",
  {
    productId: int("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    divisionId: int("division_id")
      .notNull()
      .references(() => divisions.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.divisionId] }),
    index("product_divisions_division_id_idx").on(t.divisionId),
  ],
);

// Page content for the DIVISIONS spec tables (Figma table rows), independent of the
// Product Catalog. A row MAY optionally link to a real catalog product (productId) so its
// row stays clickable through to that product's detail page — but the row's existence and
// text content are not the catalog, and a row must not require a catalog product to exist.
export const divisionSpecRows = mysqlTable(
  "division_spec_rows",
  {
    id: int("id").autoincrement().primaryKey(),
    divisionId: int("division_id")
      .notNull()
      .references(() => divisions.id, { onDelete: "cascade" }),
    productId: int("product_id").references(() => products.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    spec: varchar("spec", { length: 255 }),
    description: varchar("description", { length: 500 }),
    sortOrder: int("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("division_spec_rows_division_id_idx").on(t.divisionId)],
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
