import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategories,
  getCategoryBySlug,
  getProductsByDivisionSlug,
  getSpecRowsByDivisionId,
} from "@/lib/data/content";
import { storageUrl } from "@/lib/utils/asset-url";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { ProductCard } from "@/components/ui/product-card";
import { EmptyProductsState } from "@/components/ui/empty-products-state";
import { Reveal } from "@/components/ui/reveal";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { CategoryThemeSync } from "@/components/layout/category-theme-context";
import { ProductCategoriesList } from "@/components/features/divisions/product-categories-list";
import { CategoryIntro } from "@/components/features/divisions/category-intro";
import { CategoryTitleBanner } from "@/components/features/divisions/category-title-banner";

// Same ISR pattern as /divisions: no rebuild needed for future division/product changes to
// show up here — see app/(public)/divisions/page.tsx for the full explanation.
export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const division = await getCategoryBySlug(slug);
  if (!division) return {};
  return {
    title: `${division.name} — Entaj`,
    description: division.subtitle ?? undefined,
  };
}

export default async function DivisionProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const division = await getCategoryBySlug(slug);
  if (!division) notFound();

  const [divisionProducts, specRows] = await Promise.all([
    getProductsByDivisionSlug(slug),
    getSpecRowsByDivisionId(division.id),
  ]);

  return (
    <>
      <CategoryThemeSync color={division.bgColor} />
      <CategoryTitleBanner name={division.name} />
      <PageBreadcrumb
        items={[
          { label: "Divisions", href: "/divisions" },
          { label: division.name },
        ]}
      />
      <Section className="py-10 lg:py-16">
        <Container>
          <Reveal>
            {division.subtitle && division.description ? (
              <CategoryIntro
                iconSrc={storageUrl(division.iconPath)}
                title={division.subtitle}
                description={division.description}
              />
            ) : division.description ? (
              <p className="mx-auto max-w-2xl text-center font-expanded text-lg text-entaj-medium-grey">
                {division.description}
              </p>
            ) : null}
          </Reveal>

          {divisionProducts.length > 0 ? (
            <div className="mt-12 grid grid-cols-2 items-stretch gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
              {divisionProducts.map((product, index) => (
                <Reveal key={product.id} delay={index * 60} className="h-full">
                  <ProductCard
                    id={product.id}
                    name={product.recommendedLabel ?? product.name}
                    imageSrc={storageUrl(product.imagePath)}
                    featured={product.isFeatured}
                  />
                </Reveal>
              ))}
            </div>
          ) : specRows.length === 0 ? (
            // "Products coming soon" only applies to a division whose page has nothing else
            // to show yet. A division with a populated Product Categories table (e.g. Safety
            // Equipment & PPE, whose Figma page has no product grid at all) has real content
            // below, so the placeholder would be redundant/wrong there.
            <Reveal variant="scale">
              <EmptyProductsState />
            </Reveal>
          ) : null}
        </Container>
      </Section>

      {specRows.length > 0 ? (
        <Section className="pt-0 pb-10 lg:pb-16">
          <Container>
            <Reveal>
              <GradientHeading as="h2" className="mb-6 text-2xl lg:text-[32px]">
                Product Categories
              </GradientHeading>
              <ProductCategoriesList rows={specRows} />
            </Reveal>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
