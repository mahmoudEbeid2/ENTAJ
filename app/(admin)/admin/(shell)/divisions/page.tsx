import type { Metadata } from "next";
import { asc, count, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { divisions, products } from "@/database/schema";
import { DivisionsTable } from "@/components/admin/divisions/divisions-table";

export const metadata: Metadata = { title: "Divisions — Entaj Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDivisionsPage() {
  const [allDivisions, productCounts] = await Promise.all([
    db.select().from(divisions).where(isNull(divisions.deletedAt)).orderBy(asc(divisions.sortOrder)),
    db
      .select({ divisionId: products.divisionId, value: count() })
      .from(products)
      .where(isNull(products.deletedAt))
      .groupBy(products.divisionId),
  ]);

  const countByDivision = new Map(productCounts.map((r) => [r.divisionId, r.value]));
  const divisionsWithCounts = allDivisions.map((d) => ({
    ...d,
    productCount: countByDivision.get(d.id) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Divisions</h1>
        <p className="text-sm text-muted-foreground">
          {allDivisions.length} division{allDivisions.length === 1 ? "" : "s"}.
        </p>
      </div>
      <DivisionsTable divisions={divisionsWithCounts} />
    </div>
  );
}
