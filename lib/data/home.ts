import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ctaPanels, heroSlides, marketRegions, pageSections, stats, valueProps, whyUsFeatures } from "@/database/schema";
import type { PageSlug } from "@/database/schema";

export async function getHeroSlides(page: PageSlug) {
  return db
    .select()
    .from(heroSlides)
    .where(and(eq(heroSlides.page, page), eq(heroSlides.isActive, true)))
    .orderBy(asc(heroSlides.sortOrder));
}

export async function getStats(page: PageSlug, variant: "counter" | "timeline") {
  return db
    .select()
    .from(stats)
    .where(and(eq(stats.page, page), eq(stats.variant, variant)))
    .orderBy(asc(stats.sortOrder));
}

export async function getValueProps() {
  return db.select().from(valueProps).orderBy(asc(valueProps.sortOrder));
}

export async function getWhyUsFeatures() {
  return db.select().from(whyUsFeatures).orderBy(asc(whyUsFeatures.sortOrder));
}

export async function getMarketRegions() {
  return db.select().from(marketRegions).orderBy(asc(marketRegions.sortOrder));
}

export async function getCtaPanel(key: "quality_compliance" | "home_contact_cta" | "about_contact_cta") {
  const [panel] = await db.select().from(ctaPanels).where(eq(ctaPanels.key, key)).limit(1);
  return panel ?? null;
}

export async function getPageSection(page: PageSlug, sectionKey: string) {
  const [section] = await db
    .select()
    .from(pageSections)
    .where(
      and(
        eq(pageSections.page, page),
        eq(pageSections.sectionKey, sectionKey),
        eq(pageSections.isActive, true),
      ),
    )
    .limit(1);
  return section ?? null;
}
