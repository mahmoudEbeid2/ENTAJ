"use client";

import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroSlideFormDialog } from "@/components/admin/content/hero-slide-form-dialog";
import { PageSectionFormDialog } from "@/components/admin/content/page-section-form-dialog";
import { SeoMetaFormDialog } from "@/components/admin/content/seo-meta-form-dialog";
import { StatFormDialog } from "@/components/admin/content/stat-form-dialog";
import { ValuePropFormDialog } from "@/components/admin/content/value-prop-form-dialog";
import { WhyUsFeatureFormDialog } from "@/components/admin/content/why-us-feature-form-dialog";
import { MarketRegionFormDialog } from "@/components/admin/content/market-region-form-dialog";
import { CtaPanelFormDialog } from "@/components/admin/content/cta-panel-form-dialog";
import { OfficeFormDialog } from "@/components/admin/content/office-form-dialog";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { deleteHeroSlide } from "@/actions/admin/content";
import { storageUrl } from "@/lib/utils/asset-url";
import { PAGE_SLUGS, type PageSlug } from "@/database/schema";
import type {
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

type HeroSlide = typeof heroSlides.$inferSelect;
type PageSection = typeof pageSections.$inferSelect;
type SeoMeta = typeof seoMeta.$inferSelect;
type Stat = typeof stats.$inferSelect;
type ValueProp = typeof valueProps.$inferSelect;
type WhyUsFeature = typeof whyUsFeatures.$inferSelect;
type MarketRegion = typeof marketRegions.$inferSelect;
type CtaPanel = typeof ctaPanels.$inferSelect;
type Office = typeof offices.$inferSelect;

const PAGE_LABEL: Record<PageSlug, string> = {
  home: "Home",
  about: "About",
  divisions: "Divisions",
  contact: "Contact",
};

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 rounded-lg border p-3">{children}</div>;
}

export function ContentManager({
  heroSlides: allSlides,
  pageSections: allSections,
  seoMeta: allSeoMeta,
  stats: allStats,
  valueProps: allValueProps,
  whyUsFeatures: allWhyUsFeatures,
  marketRegions: allMarketRegions,
  ctaPanels: allCtaPanels,
  offices: allOffices,
}: {
  heroSlides: HeroSlide[];
  pageSections: PageSection[];
  seoMeta: SeoMeta[];
  stats: Stat[];
  valueProps: ValueProp[];
  whyUsFeatures: WhyUsFeature[];
  marketRegions: MarketRegion[];
  ctaPanels: CtaPanel[];
  offices: Office[];
}) {
  return (
    <Tabs defaultValue="home">
      <TabsList>
        {PAGE_SLUGS.map((page) => (
          <TabsTrigger key={page} value={page}>
            {PAGE_LABEL[page]}
          </TabsTrigger>
        ))}
        <TabsTrigger value="shared">Shared</TabsTrigger>
      </TabsList>

      {PAGE_SLUGS.map((page) => {
        const slides = allSlides.filter((s) => s.page === page).sort((a, b) => a.sortOrder - b.sortOrder);
        const sections = allSections.filter((s) => s.page === page).sort((a, b) => a.sortOrder - b.sortOrder);
        const seo = allSeoMeta.find((s) => s.pageSlug === page);
        const pageStats = allStats.filter((s) => s.page === page).sort((a, b) => a.sortOrder - b.sortOrder);

        return (
          <TabsContent key={page} value={page} className="flex flex-col gap-6 pt-4">
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold">SEO</h2>
              {seo ? (
                <Row>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{seo.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{seo.description}</p>
                  </div>
                  <SeoMetaFormDialog
                    meta={seo}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Edit SEO">
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                </Row>
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No SEO metadata configured for this page.
                </p>
              )}
            </section>

            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Hero Slides</h2>
                <HeroSlideFormDialog
                  page={page}
                  trigger={
                    <Button size="sm" variant="outline">
                      <Plus className="size-4" />
                      Add Slide
                    </Button>
                  }
                />
              </div>
              {slides.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No hero slides for this page yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {slides.map((slide) => (
                    <Row key={slide.id}>
                      <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={storageUrl(slide.imagePath)!}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{slide.title}</p>
                        {slide.subtitle ? (
                          <p className="truncate text-xs text-muted-foreground">{slide.subtitle}</p>
                        ) : null}
                      </div>
                      {!slide.isActive ? <Badge variant="secondary">Inactive</Badge> : null}
                      <div className="flex shrink-0 gap-1">
                        <HeroSlideFormDialog
                          page={page}
                          slide={slide}
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label="Edit slide">
                              <Pencil className="size-4" />
                            </Button>
                          }
                        />
                        <ConfirmDeleteDialog
                          title="Delete this hero slide?"
                          onConfirm={() => deleteHeroSlide(slide.id)}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Delete slide"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          }
                        />
                      </div>
                    </Row>
                  ))}
                </div>
              )}
            </section>

            {pageStats.length > 0 ? (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold">Stats</h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {pageStats.map((stat) => (
                    <Row key={stat.id}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{stat.value}</p>
                        <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                      <StatFormDialog
                        stat={stat}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label="Edit stat">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                    </Row>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold">Page Sections</h2>
              {sections.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No editable sections for this page yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {sections.map((section) => (
                    <Row key={section.id}>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          {section.sectionKey}
                        </p>
                        <p className="truncate text-sm font-medium">
                          {section.heading || section.body || "(untitled)"}
                        </p>
                      </div>
                      {!section.isActive ? <Badge variant="secondary">Inactive</Badge> : null}
                      <PageSectionFormDialog
                        section={section}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label="Edit section">
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                    </Row>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>
        );
      })}

      <TabsContent value="shared" className="flex flex-col gap-6 pt-4">
        <p className="text-xs text-muted-foreground">
          Shared blocks reused across multiple pages (Home &amp; About, etc.) — editing here updates every
          page that displays it.
        </p>

        {allValueProps.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Value Props (&quot;What Sets Us Apart&quot;)</h2>
            <div className="flex flex-col gap-2">
              {allValueProps
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => (
                  <Row key={item.id}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ValuePropFormDialog
                      item={item}
                      trigger={
                        <Button variant="ghost" size="icon-sm" aria-label="Edit value prop">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                  </Row>
                ))}
            </div>
          </section>
        ) : null}

        {allWhyUsFeatures.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Why Entaj Features</h2>
            <div className="flex flex-col gap-2">
              {allWhyUsFeatures
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((feature) => (
                  <Row key={feature.id}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {feature.number}. {feature.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                    <WhyUsFeatureFormDialog
                      feature={feature}
                      trigger={
                        <Button variant="ghost" size="icon-sm" aria-label="Edit feature">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                  </Row>
                ))}
            </div>
          </section>
        ) : null}

        {allMarketRegions.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Markets We Serve</h2>
            <div className="flex flex-col gap-2">
              {allMarketRegions
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((region) => (
                  <Row key={region.id}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{region.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{region.countries}</p>
                    </div>
                    <MarketRegionFormDialog
                      region={region}
                      trigger={
                        <Button variant="ghost" size="icon-sm" aria-label="Edit region">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                  </Row>
                ))}
            </div>
          </section>
        ) : null}

        {allCtaPanels.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">CTA Panels</h2>
            <div className="flex flex-col gap-2">
              {allCtaPanels.map((panel) => (
                <Row key={panel.id}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{panel.heading}</p>
                    <p className="truncate text-xs text-muted-foreground">{panel.body}</p>
                  </div>
                  <CtaPanelFormDialog
                    panel={panel}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Edit CTA panel">
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                </Row>
              ))}
            </div>
          </section>
        ) : null}

        {allOffices.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Offices</h2>
            <div className="flex flex-col gap-2">
              {allOffices
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((office) => (
                  <Row key={office.id}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{office.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{office.address}</p>
                    </div>
                    {office.isPrimary ? <Badge variant="outline">Primary</Badge> : null}
                    <OfficeFormDialog
                      office={office}
                      trigger={
                        <Button variant="ghost" size="icon-sm" aria-label="Edit office">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                  </Row>
                ))}
            </div>
          </section>
        ) : null}
      </TabsContent>
    </Tabs>
  );
}
