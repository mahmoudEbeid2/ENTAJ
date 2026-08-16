import { boolean, index, int, mysqlEnum, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { PAGE_SLUGS, timestamps } from "./common";

export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  siteName: varchar("site_name", { length: 150 }).notNull().default("ENTAJ"),
  tagline: varchar("tagline", { length: 255 }),
  footerTagline: varchar("footer_tagline", { length: 500 }),
  establishedYear: varchar("established_year", { length: 10 }),
  parentCompany: varchar("parent_company", { length: 150 }),
  logoPath: varchar("logo_path", { length: 500 }),
  logoLockupPath: varchar("logo_lockup_path", { length: 500 }),
  footerLogoPath: varchar("footer_logo_path", { length: 500 }),
  faviconPath: varchar("favicon_path", { length: 500 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactWebsite: varchar("contact_website", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  ...timestamps,
});

export const socialLinks = mysqlTable("social_links", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["facebook", "instagram", "linkedin", "youtube"])
    .notNull()
    .unique(),
  url: varchar("url", { length: 500 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  ...timestamps,
});

export const seoMeta = mysqlTable(
  "seo_meta",
  {
    id: int("id").autoincrement().primaryKey(),
    pageSlug: mysqlEnum("page_slug", PAGE_SLUGS).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 500 }).notNull(),
    keywords: varchar("keywords", { length: 500 }),
    ogImagePath: varchar("og_image_path", { length: 500 }),
    ...timestamps,
  },
  (t) => [index("seo_meta_page_slug_idx").on(t.pageSlug)],
);

export const navItems = mysqlTable(
  "nav_items",
  {
    id: int("id").autoincrement().primaryKey(),
    menuKey: mysqlEnum("menu_key", ["header", "footer"]).notNull(),
    label: varchar("label", { length: 100 }).notNull(),
    href: varchar("href", { length: 255 }).notNull(),
    sortOrder: int("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("nav_items_menu_key_idx").on(t.menuKey)],
);
