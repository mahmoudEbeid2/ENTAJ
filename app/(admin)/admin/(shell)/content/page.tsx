import type { Metadata } from "next";
import { db } from "@/lib/db";
import {
  heroSlides,
  pageSections,
  seoMeta,
  stats,
  valueProps,
  whyUsFeatures,
  marketRegions,
  ctaPanels,
  offices,
} from "@/database/schema";
import { ContentManager } from "@/components/admin/content/content-manager";

export const metadata: Metadata = { title: "Content — Entaj Admin" };
export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [
    allSlides,
    allSections,
    allSeoMeta,
    allStats,
    allValueProps,
    allWhyUsFeatures,
    allMarketRegions,
    allCtaPanels,
    allOffices,
  ] = await Promise.all([
    db.select().from(heroSlides),
    db.select().from(pageSections),
    db.select().from(seoMeta),
    db.select().from(stats),
    db.select().from(valueProps),
    db.select().from(whyUsFeatures),
    db.select().from(marketRegions),
    db.select().from(ctaPanels),
    db.select().from(offices),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
        <p className="text-sm text-muted-foreground">
          Manage every editable block shown on the public site — SEO, hero banners, stats, page sections, and
          shared content.
        </p>
      </div>
      <ContentManager
        heroSlides={allSlides}
        pageSections={allSections}
        seoMeta={allSeoMeta}
        stats={allStats}
        valueProps={allValueProps}
        whyUsFeatures={allWhyUsFeatures}
        marketRegions={allMarketRegions}
        ctaPanels={allCtaPanels}
        offices={allOffices}
      />
    </div>
  );
}
