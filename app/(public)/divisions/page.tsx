import type { Metadata } from "next";
import { getCategories, getCategorySpecTables, getRecommendedProducts } from "@/lib/data/content";
import { getHeroSlides, getPageSection } from "@/lib/data/home";
import { getSeoMeta } from "@/lib/data/site";
import { storageUrl } from "@/lib/utils/asset-url";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHero } from "@/components/layout/page-hero";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { ProductSpecTable } from "@/components/ui/product-spec-table";
import { RecommendedGrid } from "@/components/features/divisions/recommended-grid";
import { CategoryNav } from "@/components/features/divisions/category-nav";
import { Reveal } from "@/components/ui/reveal";

// This page is statically generated with no time-based revalidation by default (see
// .next/prerender-manifest.json: initialRevalidateSeconds was false before this was added),
// so database changes to divisions/products/spec rows only appeared after an admin action
// explicitly called revalidatePath("/divisions") or a full rebuild. ISR here means any
// future DB change shows up within 60s without either of those.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("divisions");
  if (!seo) return {};
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords ?? undefined,
    openGraph: seo.ogImagePath ? { images: [storageUrl(seo.ogImagePath)!] } : undefined,
  };
}

export default async function DivisionsPage() {
  const [slides, productsIntro, recommended, categories, specTables] = await Promise.all([
    getHeroSlides("divisions"),
    getPageSection("divisions", "products_intro"),
    getRecommendedProducts(),
    getCategories(),
    getCategorySpecTables(),
  ]);

  const hero = slides[0];

  return (
    <>
      {hero ? (
        <PageHero title={hero.title} imageSrc={storageUrl(hero.imagePath) ?? ""} imageAlt={hero.title} size="compact" />
      ) : null}

      {/* Always rendered regardless of active-category count: every category created in the
          admin dashboard shows here, even with zero products, since CategoryNav now renders
          straight from the categories table instead of a hardcoded card list. */}
      <Section className="pt-8 pb-0 lg:pt-12">
        <Container>
          <Reveal>
            <GradientHeading as="h2" className="mb-8 text-center text-3xl lg:text-[36px]">
              OUR CATEGORIES
            </GradientHeading>
            <CategoryNav
              categories={categories.map((category) => ({
                id: category.id,
                slug: category.slug,
                name: category.name,
                bgColor: category.bgColor,
                iconSrc: storageUrl(category.iconPath),
              }))}
            />
          </Reveal>
        </Container>
      </Section>

      {/* Always rendered regardless of recommended-product count: shows an empty grid when
          there are no active recommended products rather than hiding the whole section. */}
      <Section>
        <Container>
          <Reveal>
            {productsIntro?.heading ? (
              <GradientHeading as="h2" className="mb-8 text-center text-4xl lg:text-[48px]">
                {productsIntro.heading}
              </GradientHeading>
            ) : null}
            <p className="text-gradient-entaj mb-6 font-sans text-2xl font-bold lg:text-[28px]">Recommended</p>
          </Reveal>
          <RecommendedGrid
            products={recommended.map((product) => ({
              id: product.id,
              name: product.recommendedLabel ?? product.name,
              imageSrc: storageUrl(product.imagePath),
              featured: product.isFeatured,
            }))}
          />
        </Container>
      </Section>

      {specTables
        .filter((table) => table.specRows && table.specRows.length > 0)
        .map((table) => (
          <Section key={table.id} id={table.slug} className="scroll-mt-24 pt-0">
            <Container>
              <Reveal>
                <GradientHeading as="h2" className="mb-8 text-center text-4xl lg:text-[48px]">
                  {table.name}
                </GradientHeading>
                <ProductSpecTable products={table.specRows} />
              </Reveal>
            </Container>
          </Section>
        ))}
    </>
  );
}

