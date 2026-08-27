import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FileText } from "lucide-react";
import { getProductDocument } from "@/lib/data/content";
import { formatBytes } from "@/lib/utils/format-bytes";
import { PRODUCT_DOCUMENT_LABELS } from "@/lib/constants/product-documents";
import { PRODUCT_DOCUMENT_TYPES, type ProductDocumentType } from "@/database/schema";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { DocumentActions } from "@/components/features/products/document-actions";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";

function isDocumentType(value: string): value is ProductDocumentType {
  return (PRODUCT_DOCUMENT_TYPES as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; type: string }>;
}): Promise<Metadata> {
  const { id, type } = await params;
  if (!isDocumentType(type)) return {};
  const document = await getProductDocument(Number(id), type);
  if (!document) return {};
  return { title: `${PRODUCT_DOCUMENT_LABELS[type]} — ${document.product.name} — Entaj` };
}

export default async function ProductDocumentPage({
  params,
}: {
  params: Promise<{ id: string; type: string }>;
}) {
  const { id: idParam, type } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0 || !isDocumentType(type)) notFound();

  const document = await getProductDocument(id, type);
  if (!document) notFound();

  const fileHref = `/api/products/${id}/documents/${type}`;
  const downloadHref = `${fileHref}?download=1`;
  const backHref = `/products/${id}`;

  return (
    <>
      <PageBreadcrumb
        items={[
          { label: document.product.name, href: backHref },
          { label: PRODUCT_DOCUMENT_LABELS[type] },
        ]}
      />
      <Section className="py-10 lg:py-16">
        <Container narrow>
          <h1 className="font-sans text-2xl font-semibold uppercase text-entaj-text sm:text-3xl">
            {PRODUCT_DOCUMENT_LABELS[type]}
          </h1>
          <p className="mt-1.5 font-expanded text-sm text-entaj-medium-grey">{document.product.name}</p>

          <div className="mt-6 mb-8 flex flex-col gap-4 rounded-2xl border border-entaj-blue/10 bg-white p-5 shadow-[0_1px_2px_rgba(44,56,142,0.06)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-entaj-light-grey text-entaj-blue">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-expanded text-sm font-semibold text-entaj-text">
                  {document.fileName}
                </p>
                <p className="font-expanded text-xs text-entaj-medium-grey">
                  PDF Document · {formatBytes(document.fileSizeBytes)}
                </p>
              </div>
            </div>
          </div>

          <DocumentActions fileHref={fileHref} downloadHref={downloadHref} backHref={backHref} />
        </Container>
      </Section>
    </>
  );
}
