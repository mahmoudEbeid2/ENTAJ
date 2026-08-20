import type { ProductDocumentType } from "@/database/schema";

export const PRODUCT_DOCUMENT_LABELS: Record<ProductDocumentType, string> = {
  msds: "Safety Data Sheet (MSDS)",
  coa: "Certificate of Analysis (COA)",
};
