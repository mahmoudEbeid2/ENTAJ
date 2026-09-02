import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getProductsByDivisionSlug } from "@/lib/data/content";
import { storageUrl } from "@/lib/utils/asset-url";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { ProductCard } from "@/components/ui/product-card";
import { Reveal } from "@/components/ui/reveal";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";

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

  const divisionProducts = await getProductsByDivisionSlug(slug);

  return (
    <>
      <PageBreadcrumb
        items={[
          { label: "Divisions", href: "/divisions" },
          { label: division.name },
        ]}
      />
      <Section className="py-10 lg:py-16">
        <Container>
          <Reveal>
            <GradientHeading as="h1" className="text-center text-3xl lg:text-[48px]">
              {division.name}
            </GradientHeading>
            {division.subtitle ? (
              <p className="mx-auto mt-4 max-w-2xl text-center font-expanded text-lg text-entaj-medium-grey">
                {division.subtitle}
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
          ) : (
            <p className="mt-12 text-center font-expanded text-entaj-medium-grey">
              No products are currently listed under this division.
            </p>
          )}
        </Container>
      </Section>
    </>
  );
}
