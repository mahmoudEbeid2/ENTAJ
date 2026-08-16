import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  varchar,
} from "drizzle-orm/mysql-core";
import { PAGE_SLUGS, timestamps } from "./common";

const pageEnum = mysqlEnum("page", PAGE_SLUGS);

export const heroSlides = mysqlTable(
  "hero_slides",
  {
    id: int("id").autoincrement().primaryKey(),
    page: pageEnum.notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 500 }),
    imagePath: varchar("image_path", { length: 500 }).notNull(),
    ctaPrimaryLabel: varchar("cta_primary_label", { length: 100 }),
    ctaPrimaryHref: varchar("cta_primary_href", { length: 255 }),
    ctaSecondaryLabel: varchar("cta_secondary_label", { length: 100 }),
    ctaSecondaryHref: varchar("cta_secondary_href", { length: 255 }),
    sortOrder: int("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("hero_slides_page_idx").on(t.page)],
);

export const stats = mysqlTable(
  "stats",
  {
    id: int("id").autoincrement().primaryKey(),
    page: pageEnum.notNull(),
    variant: mysqlEnum("variant", ["counter", "timeline"]).notNull().default("counter"),
    value: varchar("value", { length: 50 }).notNull(),
    label: varchar("label", { length: 150 }).notNull(),
    iconPath: varchar("icon_path", { length: 500 }),
    sortOrder: int("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("stats_page_variant_idx").on(t.page, t.variant)],
);

export const valueProps = mysqlTable("value_props", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }).notNull(),
  /** About page renders shorter, distinct copy per Figma (node 2:979) — falls back to title/description when unset. */
  aboutTitle: varchar("about_title", { length: 255 }),
  aboutDescription: varchar("about_description", { length: 1000 }),
  homeIconPath: varchar("home_icon_path", { length: 500 }),
  aboutIconPath: varchar("about_icon_path", { length: 500 }),
  sortOrder: int("sort_order").notNull().default(0),
  ...timestamps,
});

export const whyUsFeatures = mysqlTable("why_us_features", {
  id: int("id").autoincrement().primaryKey(),
  number: int("number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }).notNull(),
  imagePath: varchar("image_path", { length: 500 }),
  sortOrder: int("sort_order").notNull().default(0),
  ...timestamps,
});

export const marketRegions = mysqlTable("market_regions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  countries: varchar("countries", { length: 500 }).notNull(),
  sortOrder: int("sort_order").notNull().default(0),
  ...timestamps,
});

export const ctaPanels = mysqlTable("cta_panels", {
  id: int("id").autoincrement().primaryKey(),
  key: mysqlEnum("key", ["quality_compliance", "home_contact_cta", "about_contact_cta"])
    .notNull()
    .unique(),
  /** "dark" = blue-gradient panel with white text (Quality & Compliance); "light" = white panel with navy/grey text (Contact CTAs) — per Figma. */
  variant: mysqlEnum("variant", ["dark", "light"]).notNull().default("dark"),
  heading: varchar("heading", { length: 255 }).notNull(),
  /** Bold headline shown below the small heading label, e.g. "Let's Talk About What You Need." — only used by "light" variant panels. */
  subheading: varchar("subheading", { length: 255 }),
  body: varchar("body", { length: 2000 }).notNull(),
  iconPath: varchar("icon_path", { length: 500 }),
  illustrationPath: varchar("illustration_path", { length: 500 }),
  buttonLabel: varchar("button_label", { length: 100 }),
  buttonHref: varchar("button_href", { length: 255 }),
  ...timestamps,
});

export const pageSections = mysqlTable(
  "page_sections",
  {
    id: int("id").autoincrement().primaryKey(),
    page: pageEnum.notNull(),
    sectionKey: varchar("section_key", { length: 100 }).notNull(),
    eyebrow: varchar("eyebrow", { length: 150 }),
    heading: varchar("heading", { length: 500 }),
    subheading: varchar("subheading", { length: 500 }),
    body: varchar("body", { length: 3000 }),
    imagePath: varchar("image_path", { length: 500 }),
    extra: json("extra").$type<Record<string, unknown>>(),
    sortOrder: int("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("page_sections_page_section_key_idx").on(t.page, t.sectionKey)],
);
