import type { Metadata } from "next";
import { asc, count, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products, divisionSpecRows } from "@/database/schema";
import { CategoriesTable } from "@/components/admin/categories/categories-table";

export const metadata: Metadata = { title: "Categories — Entaj Admin" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [allCategories, productCounts, specRowCounts] = await Promise.all([
    db.select().from(categories).where(isNull(categories.deletedAt)).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select({ categoryId: products.divisionId, value: count() })
      .from(products)
      .where(isNull(products.deletedAt))
      .groupBy(products.divisionId),
    db
      .select({ categoryId: divisionSpecRows.divisionId, value: count() })
      .from(divisionSpecRows)
      .groupBy(divisionSpecRows.divisionId),
  ]);

  const countByProduct = new Map(productCounts.map((r) => [r.categoryId, r.value]));
  const countBySpecRow = new Map(specRowCounts.map((r) => [r.categoryId, r.value]));

  const categoriesWithCounts = allCategories.map((c) => ({
    ...c,
    productCount: countByProduct.get(c.id) ?? 0,
    specRowCount: countBySpecRow.get(c.id) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          {allCategories.length} product categor{allCategories.length === 1 ? "y" : "ies"} (independent data source for catalog, navigation, and specification tables).
        </p>
      </div>
      <CategoriesTable categories={categoriesWithCounts} />
    </div>
  );
}
