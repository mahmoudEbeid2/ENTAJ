import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { navItems, offices, seoMeta, siteSettings, socialLinks } from "@/database/schema";
import type { PageSlug } from "@/database/schema";

export async function getSiteSettings() {
  const [settings] = await db.select().from(siteSettings).limit(1);
  return settings ?? null;
}

export async function getNavItems(menuKey: "header" | "footer") {
  return db
    .select()
    .from(navItems)
    .where(and(eq(navItems.menuKey, menuKey), eq(navItems.isActive, true)))
    .orderBy(asc(navItems.sortOrder));
}

export async function getSocialLinks() {
  return db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.isActive, true))
    .orderBy(asc(socialLinks.sortOrder));
}

export async function getOffices() {
  return db.select().from(offices).orderBy(asc(offices.sortOrder));
}

export async function getSeoMeta(pageSlug: PageSlug) {
  const [meta] = await db.select().from(seoMeta).where(eq(seoMeta.pageSlug, pageSlug)).limit(1);
  return meta ?? null;
}
