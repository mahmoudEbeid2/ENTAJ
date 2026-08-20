import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Star } from "lucide-react";
import { getProductById } from "@/lib/data/content";
import { storageUrl } from "@/lib/utils/asset-url";
import { formatBytes } from "@/lib/utils/format-bytes";
import { PRODUCT_DOCUMENT_LABELS } from "@/lib/constants/product-documents";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) return {};
  return {
    title: `${product.name} — Entaj`,
    description: product.description ?? undefined,
    openGraph: product.imagePath ? { images: [storageUrl(product.imagePath)!] } : undefined,
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const product = await getProductById(id);
  if (!product) notFound();

  const imageSrc = storageUrl(product.imagePath);
  const quoteHref = `/contact?product=${product.id}&division=${product.division.id}`;

  return (
    <>
      <PageBreadcrumb
        items={[
          { label: "Divisions", href: "/divisions" },
          { label: product.division.name },
        ]}
      />
      <Section className="py-10 lg:py-16">
        <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#eef1fa_0%,#e4ecf5_100%)]">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-contain p-10 sm:p-14"
                />
              ) : null}
              {product.isFeatured ? (
                <span className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-expanded text-xs font-semibold text-entaj-blue shadow-sm">
                  <Star className="size-3.5 fill-entaj-blue text-entaj-blue" />
                  Featured
                </span>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="flex h-full flex-col">
              <span className="w-fit rounded-full bg-entaj-light-grey px-3 py-1 font-expanded text-xs font-semibold tracking-wide text-entaj-blue uppercase">
                {product.division.name}
              </span>

              <h1 className="mt-4 font-sans text-3xl font-semibold uppercase text-entaj-text sm:text-4xl">
                {product.name}
              </h1>

              {product.spec ? (
                <p className="mt-3 font-expanded text-lg font-bold text-entaj-blue">{product.spec}</p>
              ) : null}

              {product.description ? (
                <p className="mt-4 font-expanded text-base leading-relaxed text-entaj-dark-grey">
                  {product.description}
                </p>
              ) : null}

              {product.documents.length > 0 ? (
                <div className="mt-8 border-t border-entaj-blue/10 pt-8">
                  <h2 className="font-expanded text-sm font-semibold tracking-wide text-entaj-dark-grey uppercase">
                    Technical Documents
                  </h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {product.documents.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/products/${product.id}/documents/${doc.type}`}
                        className="group flex items-center gap-3 rounded-xl border border-entaj-blue/10 bg-white px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-entaj-blue/25 hover:shadow-md"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-entaj-light-grey text-entaj-blue">
                          <FileText className="size-5" />
                        </span>
                        <span className="flex flex-1 flex-col">
                          <span className="font-expanded text-sm font-semibold text-entaj-text">
                            {PRODUCT_DOCUMENT_LABELS[doc.type]}
                          </span>
                          <span className="font-expanded text-xs text-entaj-medium-grey">
                            PDF · {formatBytes(doc.fileSizeBytes)}
                          </span>
                        </span>
                        <span className="font-expanded text-sm font-semibold text-entaj-blue">View</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-8 border-t border-entaj-blue/10 pt-8">
                <Button
                  render={<Link href={quoteHref} />}
                  className="h-[56px] w-full rounded-3xl bg-entaj-blue text-base font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-entaj-blue/90 hover:shadow-lg sm:w-auto sm:px-10 sm:text-lg"
                >
                  Request a Quote
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
        </Container>
      </Section>
    </>
  );
}
