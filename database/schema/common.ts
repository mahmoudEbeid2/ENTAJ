import { timestamp } from "drizzle-orm/mysql-core";

export const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
};

export const softDelete = {
  deletedAt: timestamp("deleted_at"),
};

export const PAGE_SLUGS = ["home", "about", "divisions", "contact"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];
