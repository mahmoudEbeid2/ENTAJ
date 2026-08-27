import type { Metadata } from "next";
import { asc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { homeDivisions } from "@/database/schema";
import { DivisionsTable } from "@/components/admin/divisions/divisions-table";

export const metadata: Metadata = { title: "Home Divisions — Entaj Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDivisionsPage() {
  const allHomeDivisions = await db
    .select()
    .from(homeDivisions)
    .where(isNull(homeDivisions.deletedAt))
    .orderBy(asc(homeDivisions.sortOrder));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Home Divisions</h1>
        <p className="text-sm text-muted-foreground">
          {allHomeDivisions.length} showcase card{allHomeDivisions.length === 1 ? "" : "s"} displayed on the Home page.
        </p>
      </div>
      <DivisionsTable divisions={allHomeDivisions} />
    </div>
  );
}

