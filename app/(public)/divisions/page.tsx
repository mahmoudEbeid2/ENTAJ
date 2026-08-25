import type { Metadata } from "next";
import { getDivisionsWithSpecRows, getRecommendedProducts } from "@/lib/data/content";
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
  const [slides, productsIntro, recommended, divisionsWithSpecRows] = await Promise.all([
    getHeroSlides("divisions"),
    getPageSection("divisions", "products_intro"),
    getRecommendedProducts(),
    getDivisionsWithSpecRows(),
  ]);

  const hero = slides[0];

  return (
    <>
      {hero ? (
        <PageHero title={hero.title} imageSrc={storageUrl(hero.imagePath) ?? ""} imageAlt={hero.title} size="compact" />
      ) : null}

      {divisionsWithSpecRows.length > 0 ? (
        <Section className="pt-8 pb-0 lg:pt-12">
          <Container>
            <Reveal>
              <GradientHeading as="h2" className="mb-8 text-center text-3xl lg:text-[36px]">
                OUR CATEGORIES
              </GradientHeading>
              <CategoryNav
                availableDivisionSlugs={divisionsWithSpecRows.map((division) => division.slug)}
              />
            </Reveal>
          </Container>
        </Section>
      ) : null}

      {recommended.length > 0 ? (
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
      ) : null}

      {divisionsWithSpecRows
        .filter((division) => division.slug !== "animal-nutrition")
        .map((division) => (
          <Section key={division.id} id={division.slug} className="scroll-mt-24 pt-0">
            <Container>
              <Reveal>
                <GradientHeading as="h2" className="mb-8 text-center text-4xl lg:text-[48px]">
                  {division.name}
                </GradientHeading>
                <ProductSpecTable products={division.specRows.filter((row) => row.spec)} />
              </Reveal>
            </Container>
          </Section>
        ))}
    </>
  );
}
