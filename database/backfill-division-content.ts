// One-off, idempotent backfill for an ALREADY-SEEDED database (e.g. production) that
// predates the `division_spec_rows` table / the 5-division DIVISIONS content, or that
// was seeded from an older version of database/seed-data/divisions.ts.
//
// database/seed.ts only runs its full insert path once (it no-ops to an admin-credential
// sync as soon as `site_settings` has any rows) — so a division or spec-table row added to
// seed-data/divisions.ts after a database has already been seeded once will NEVER reach
// that database via `npm run db:seed` alone. This script closes that gap: it inserts
// exactly what's missing (by slug / by division+name), touches nothing that already
// exists, and is safe to re-run any number of times.
//
// Usage (against whichever DATABASE_URL is in the environment):
//   npx tsx database/backfill-division-content.ts
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { homeDivisions, categories, divisions, products, divisionSpecRows } from "@/database/schema";
import { homeDivisionDefs, categoryDefs, divisionDefs, productSeedGroups, specRowGroups } from "@/database/seed-data/divisions";

async function main() {
  console.log("Backfilling home divisions (Home page cards)...");
  const existingHomeDivisions = await db.select().from(homeDivisions);
  const existingHomeSlugs = new Set(existingHomeDivisions.map((d) => d.slug).filter(Boolean));
  const missingHomeDivisions = homeDivisionDefs.filter((d) => !existingHomeSlugs.has(d.slug));
  if (missingHomeDivisions.length > 0) {
    await db.insert(homeDivisions).values(missingHomeDivisions);
    console.log(`  Inserted ${missingHomeDivisions.length} missing home division(s).`);
  } else {
    console.log("  All home divisions already present.");
  }

  console.log("Backfilling categories...");
  const existingDivisions = await db.select().from(divisions);
  const existingBySlug = new Map(existingDivisions.map((d) => [d.slug, d]));

  const missingDivisions = categoryDefs.filter((d) => !existingBySlug.has(d.slug));
  if (missingDivisions.length > 0) {
    await db.insert(categories).values(missingDivisions);
    console.log(`  Inserted ${missingDivisions.length} missing category/categories: ${missingDivisions.map((d) => d.slug).join(", ")}`);
  } else {
    console.log("  All categories already present — nothing to insert.");
  }

  const allDivisions = await db.select().from(divisions);
  const divisionBySlug = (slug: string) => {
    const division = allDivisions.find((d) => d.slug === slug);
    if (!division) throw new Error(`Category "${slug}" not found after backfill — check seed-data/divisions.ts`);
    return division;
  };


  console.log("Backfilling Product Catalog rows (only for divisions with zero products)...");
  for (const { divisionSlug, products: productSeeds } of productSeedGroups) {
    const division = divisionBySlug(divisionSlug);
    const existingProducts = await db.select().from(products).where(eq(products.divisionId, division.id));
    if (existingProducts.length > 0) {
      console.log(`  ${divisionSlug}: already has ${existingProducts.length} product(s) — skipping.`);
      continue;
    }
    const rows = productSeeds.map((p, i) => ({
      divisionId: division.id,
      name: p.name,
      recommendedLabel: p.recommendedLabel ?? null,
      spec: p.spec ?? null,
      description: p.description ?? null,
      imagePath: p.imagePath ?? null,
      isRecommended: p.isRecommended ?? false,
      isFeatured: p.isFeatured ?? false,
      recommendedSortOrder: p.recommendedSortOrder ?? null,
      sortOrder: i,
    }));
    await db.insert(products).values(rows);
    console.log(`  ${divisionSlug}: inserted ${rows.length} product(s).`);
  }

  const productIdByDivisionAndName = async (divisionId: number, name: string) => {
    const [row] = await db
      .select()
      .from(products)
      .where(and(eq(products.divisionId, divisionId), eq(products.name, name)))
      .limit(1);
    return row?.id ?? null;
  };

  console.log("Backfilling DIVISIONS-page spec-table rows (only for divisions with zero spec rows)...");
  for (const { divisionSlug, rows } of specRowGroups) {
    const division = divisionBySlug(divisionSlug);
    const existingRows = await db
      .select()
      .from(divisionSpecRows)
      .where(eq(divisionSpecRows.divisionId, division.id));
    if (existingRows.length > 0) {
      console.log(`  ${divisionSlug}: already has ${existingRows.length} spec row(s) — skipping (existing content is left untouched).`);
      continue;
    }
    const specRowValues = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      specRowValues.push({
        divisionId: division.id,
        productId: row.linkedProductName
          ? await productIdByDivisionAndName(division.id, row.linkedProductName)
          : null,
        name: row.name,
        spec: row.spec,
        description: row.description,
        sortOrder: i,
      });
    }
    await db.insert(divisionSpecRows).values(specRowValues);
    console.log(`  ${divisionSlug}: inserted ${specRowValues.length} spec row(s).`);
  }

  console.log("\nBackfill complete. Verifying final state...");
  for (const def of divisionDefs) {
    const division = divisionBySlug(def.slug);
    const rowCount = (
      await db.select().from(divisionSpecRows).where(eq(divisionSpecRows.divisionId, division.id))
    ).length;
    console.log(`  ${def.slug} (active=${division.isActive}): ${rowCount} spec row(s)`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
