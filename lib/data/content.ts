import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { divisions, products } from "@/database/schema";

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

export async function getDivisionsWithProducts() {
  const allDivisions = await getDivisions();
  return Promise.all(
    allDivisions.map(async (division) => {
      const divisionProducts = await db
        .select()
        .from(products)
        .where(and(eq(products.divisionId, division.id), eq(products.isActive, true)))
        .orderBy(asc(products.sortOrder));
      return { ...division, products: divisionProducts };
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
