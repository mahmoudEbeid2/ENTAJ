import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  divisions,
  products,
  productDocuments,
  divisionSpecRows,
  type ProductDocumentType,
} from "@/database/schema";

export async function getDivisions() {
  return db
    .select()
    .from(divisions)
    .where(eq(divisions.isActive, true))
    .orderBy(asc(divisions.sortOrder));
}

export async function getDivisionBySlug(slug: string) {
  const [division] = await db.select().from(divisions).where(eq(divisions.slug, slug)).limit(1);
  if (!division) return null;
  const divisionProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.divisionId, division.id), eq(products.isActive, true)))
    .orderBy(asc(products.sortOrder));
  return { ...division, products: divisionProducts };
}

/**
 * Divisions with their DIVISIONS-page spec table content (page content, sourced from
 * division_spec_rows) — independent of the Product Catalog. A spec row's optional
 * productId is included so the table can still link a row to its catalog product page.
 */
export async function getDivisionsWithSpecRows() {
  const allDivisions = await getDivisions();
  return Promise.all(
    allDivisions.map(async (division) => {
      const specRows = await db
        .select()
        .from(divisionSpecRows)
        .where(and(eq(divisionSpecRows.divisionId, division.id), eq(divisionSpecRows.isActive, true)))
        .orderBy(asc(divisionSpecRows.sortOrder));
      return { ...division, specRows };
    }),
  );
}

export async function getRecommendedProducts() {
  return db
    .select()
    .from(products)
    .where(and(eq(products.isRecommended, true), eq(products.isActive, true)))
    .orderBy(asc(products.recommendedSortOrder));
}

export async function getProductById(id: number) {
  const [row] = await db
    .select({ product: products, division: divisions })
    .from(products)
    .innerJoin(divisions, eq(products.divisionId, divisions.id))
    .where(and(eq(products.id, id), eq(products.isActive, true)))
    .limit(1);
  if (!row) return null;

  const documents = await db
    .select()
    .from(productDocuments)
    .where(eq(productDocuments.productId, id));

  return { ...row.product, division: row.division, documents };
}

export async function getProductDocument(productId: number, type: ProductDocumentType) {
  const [row] = await db
    .select({ document: productDocuments, product: products, division: divisions })
    .from(productDocuments)
    .innerJoin(products, eq(productDocuments.productId, products.id))
    .innerJoin(divisions, eq(products.divisionId, divisions.id))
    .where(
      and(
        eq(productDocuments.productId, productId),
        eq(productDocuments.type, type),
        eq(products.isActive, true),
      ),
    )
    .limit(1);
  if (!row) return null;
  return { ...row.document, product: { ...row.product, division: row.division } };
}
