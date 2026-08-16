import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { admins } from "./auth";
import { softDelete, timestamps } from "./common";

export const blogCategories = mysqlTable("blog_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  ...timestamps,
});

export const blogPosts = mysqlTable(
  "blog_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: int("category_id").references(() => blogCategories.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    excerpt: varchar("excerpt", { length: 500 }),
    content: text("content").notNull(),
    coverImagePath: varchar("cover_image_path", { length: 500 }),
    authorAdminId: int("author_admin_id").references(() => admins.id, {
      onDelete: "set null",
    }),
    status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
    publishedAt: timestamp("published_at"),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: varchar("seo_description", { length: 500 }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    index("blog_posts_category_id_idx").on(t.categoryId),
    index("blog_posts_status_idx").on(t.status),
  ],
);

export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  authorName: varchar("author_name", { length: 150 }).notNull(),
  authorRole: varchar("author_role", { length: 150 }),
  company: varchar("company", { length: 150 }),
  avatarPath: varchar("avatar_path", { length: 500 }),
  quote: varchar("quote", { length: 1000 }).notNull(),
  rating: int("rating"),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: int("sort_order").notNull().default(0),
  ...timestamps,
  ...softDelete,
});

export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: varchar("answer", { length: 2000 }).notNull(),
  category: varchar("category", { length: 100 }),
  sortOrder: int("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  logoPath: varchar("logo_path", { length: 500 }).notNull(),
  websiteUrl: varchar("website_url", { length: 500 }),
  sortOrder: int("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
});

export const services = mysqlTable(
  "services",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 2000 }).notNull(),
    iconPath: varchar("icon_path", { length: 500 }),
    imagePath: varchar("image_path", { length: 500 }),
    sortOrder: int("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("services_slug_idx").on(t.slug)],
);

export const pages = mysqlTable(
  "pages",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: varchar("seo_description", { length: 500 }),
    isPublished: boolean("is_published").notNull().default(false),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("pages_slug_idx").on(t.slug)],
);
