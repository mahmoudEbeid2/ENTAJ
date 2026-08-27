import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  divisions,
  products,
  productDocuments,
  divisionSpecRows,
  type ProductDocumentType,
} from "@/database/schema";

export async function getCategories() {
  return db
    .select()
    .from(categories)
    .where(and(eq(categories.isActive, true), isNull(categories.deletedAt)))
    .orderBy(asc(categories.sortOrder));
}

export const getDivisions = getCategories;

export async function getCategoryBySlug(slug: string) {
  const [category] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.slug, slug), isNull(categories.deletedAt)))
    .limit(1);
  if (!category) return null;
  const categoryProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.divisionId, category.id), eq(products.isActive, true), isNull(products.deletedAt)))
    .orderBy(asc(products.sortOrder));
  return { ...category, products: categoryProducts };
}

export const getDivisionBySlug = getCategoryBySlug;

/**
 * Loads categories alongside their specification table rows (independent of Home Divisions
 * and independent of Product Catalog product counts).
 */
export async function getCategorySpecTables() {
  const allCategories = await getCategories();
  return Promise.all(
    allCategories.map(async (category) => {
      const specRows = await db
        .select()
        .from(divisionSpecRows)
        .where(and(eq(divisionSpecRows.divisionId, category.id), eq(divisionSpecRows.isActive, true)))
        .orderBy(asc(divisionSpecRows.sortOrder));
      return { ...category, specRows };
    }),
  );
}

export const getDivisionsWithSpecRows = getCategorySpecTables;


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
