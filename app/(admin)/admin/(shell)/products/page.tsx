import type { Metadata } from "next";
import { asc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { divisions, products } from "@/database/schema";
import { ProductsTable } from "@/components/admin/products/products-table";

export const metadata: Metadata = { title: "Products — Entaj Admin" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [allProducts, allDivisions] = await Promise.all([
    db.select().from(products).where(isNull(products.deletedAt)).orderBy(asc(products.name)),
    db.select().from(divisions).where(isNull(divisions.deletedAt)).orderBy(asc(divisions.sortOrder)),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">
          {allProducts.length} product{allProducts.length === 1 ? "" : "s"} across{" "}
          {allDivisions.length} division{allDivisions.length === 1 ? "" : "s"}.
        </p>
      </div>
      <ProductsTable products={allProducts} divisions={allDivisions} />
    </div>
  );
}
