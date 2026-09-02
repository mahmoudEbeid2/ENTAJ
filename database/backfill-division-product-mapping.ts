// One-off, idempotent content/mapping update for the Sept 2026 division restructure brief:
// renames 2 divisions, gives 10 products real content (formula/purity/applications), and
// assigns each of those 10 to its correct set of divisions via the new `product_divisions`
// many-to-many join table (migration 0012). Safe to re-run any number of times — matches
// existing rows by name (or by name + isActive where a name collision exists across
// divisions), never inserts a new product or division row.
//
// Usage (against whichever DATABASE_URL is in the environment):
//   npx tsx database/backfill-division-product-mapping.ts
import { eq, and, or, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { divisions, products, productDivisions } from "@/database/schema";

// Every division except Base Oils (explicitly "keep all existing products unchanged" per
// the brief) gets a COMPLETE replacement product list from PRODUCT_UPDATES below — any
// product still linked to one of these divisions afterward that isn't part of that list
// (e.g. a product that kept its old products.divisionId pointing here from before this
// migration) must be unlinked, or it would incorrectly keep showing on that division's page.
const RESTRUCTURED_DIVISION_SLUGS = [
  "animal-nutrition",
  "water-treatment",
  "industrial-laundry-detergent",
  "glass-manufacturing-raw-materials",
] as const;

const DIVISION_RENAMES = [
  {
    slug: "industrial-laundry-detergent",
    name: "Cleaning & Detergent Products",
    subtitle: "Core Ingredients Behind Cleaner Everyday Products",
  },
  {
    slug: "glass-manufacturing-raw-materials",
    name: "Drilling & Industrial Chemicals",
    subtitle: "Performance Materials for Demanding Operations",
  },
] as const;

interface ProductUpdate {
  /** Exact current `name` to find the row by. */
  matchName: string;
  /** When a name collision exists across divisions, only match the currently-active row. */
  activeOnly?: boolean;
  /** Reactivate a soft-deleted row (used for the Sodium Carbonate id-17 case). */
  reactivate?: boolean;
  name: string;
  spec?: string | null;
  description: string;
  formula?: string | null;
  purity?: string | null;
  applications: string[];
  divisionSlugs: string[];
}

const PRODUCT_UPDATES: ProductUpdate[] = [
  {
    matchName: "Sodium Bicarbonate",
    name: "Sodium Bicarbonate (Feed Grade)",
    purity: "min 99.3%",
    formula: "NaHCO₃",
    description: "High-purity sodium bicarbonate manufactured specifically for the animal feed industry.",
    applications: ["Animal feed additive"],
    divisionSlugs: ["animal-nutrition"],
  },
  {
    matchName: "Sodium Carbonate",
    reactivate: true,
    name: "Sodium Carbonate",
    formula: "Na₂CO₃",
    purity: "99.2–99.6%",
    spec: "Light / Dense",
    description: "A core raw material for detergent and glass manufacturing, water softening, and general chemical synthesis.",
    applications: ["Detergents & cleaners", "Glass manufacturing", "Water softening", "Chemical synthesis"],
    divisionSlugs: ["water-treatment", "industrial-laundry-detergent"],
  },
  {
    matchName: "Calcium Chloride",
    activeOnly: true,
    name: "Calcium Chloride",
    formula: "CaCl₂",
    purity: "min 94%",
    description: "A versatile industrial salt used across oilfield operations, road maintenance, and wastewater treatment.",
    applications: ["Oilfield drilling additive", "Road de-icing agent", "Dust & moisture control", "Wastewater treatment"],
    divisionSlugs: ["water-treatment", "glass-manufacturing-raw-materials"],
  },
  {
    matchName: "Potassium Chloride",
    name: "Potassium Chloride",
    formula: "KCl",
    purity: "min 96.28%",
    description: "Used across drilling operations and water treatment, with clay-swelling inhibition properties valued by chemical industries.",
    applications: ["Drilling fluids additive", "Wastewater treatment", "Inhibits clay swelling", "Chemical industries"],
    divisionSlugs: ["water-treatment", "glass-manufacturing-raw-materials"],
  },
  {
    matchName: "Poly Aluminium Chloride (PAC 18-30%)",
    name: "Poly Aluminium Chloride (PAC)",
    purity: "29–30% Al₂O₃, 99.99% purity",
    description: "The core coagulant for drinking water purification and wastewater treatment — removes suspended particles and reduces turbidity and color.",
    applications: ["Drinking water purification", "Removes suspended particles", "Reduces turbidity & color", "Industrial & wastewater treatment"],
    divisionSlugs: ["water-treatment"],
  },
  {
    matchName: "Magnesium Hydroxide",
    name: "Magnesium Hydroxide",
    formula: "Mg(OH)₂",
    purity: "97.5% typical",
    description: "A neutralizing agent and flame-retardant additive used across wastewater treatment and industrial processes.",
    applications: ["Wastewater pH control", "Chemical neutralizer", "Flame retardant additive", "Anti-acid for industrial applications"],
    divisionSlugs: ["water-treatment", "glass-manufacturing-raw-materials"],
  },
  {
    matchName: "Sodium Metabisulphite",
    name: "Sodium Metabisulfite (SMBS)",
    purity: "~91.7%",
    description: "A dechlorination and oxygen-scavenging agent used in water treatment, oilfield operations, and textile processing.",
    applications: ["Water treatment chemical", "Removes oxygen in oil drilling operations", "Bleaching agent in textiles"],
    divisionSlugs: ["water-treatment", "glass-manufacturing-raw-materials"],
  },
  {
    matchName: "Sodium Hydroxide (Caustic Soda)",
    name: "Sodium Hydroxide (NaOH / Caustic Soda)",
    purity: "98% wet / 99.5% dry min",
    description: "A foundational chemical for soap and detergent manufacturing, pulp processing, and pH control.",
    applications: ["Soap & detergent production", "Chemical manufacturing", "Paper & pulp processing", "Water pH control"],
    divisionSlugs: ["water-treatment", "industrial-laundry-detergent"],
  },
  {
    matchName: "Magnesium Chloride",
    name: "Magnesium Chloride",
    formula: "MgCl₂",
    purity: "min 46.5%",
    description: "Widely used in oilfield drilling and road maintenance, and as a catalyst and processing agent in chemical industries.",
    applications: ["Oilfield drilling additive", "Road de-icing & dust control", "Catalyst component", "Chemical processing agent"],
    divisionSlugs: ["glass-manufacturing-raw-materials"],
  },
  {
    matchName: "Bentonite",
    name: "Bentonite",
    description: "A natural clay used as a drilling mud stabilizer, industrial binder, and sealing material across multiple sectors.",
    applications: ["Drilling mud stabilizer", "Foundry sand binder", "Civil sealing material", "Wastewater treatment agent"],
    divisionSlugs: ["water-treatment", "glass-manufacturing-raw-materials"],
  },
];

async function main() {
  console.log("=== Division/product mapping backfill ===\n");

  console.log("Renaming divisions...");
  const allDivisions = await db.select().from(divisions);
  const divisionBySlug = new Map(allDivisions.map((d) => [d.slug, d]));
  for (const rename of DIVISION_RENAMES) {
    const division = divisionBySlug.get(rename.slug);
    if (!division) {
      console.warn(`  SKIP: division "${rename.slug}" not found.`);
      continue;
    }
    if (division.name === rename.name && division.subtitle === rename.subtitle) {
      console.log(`  ${rename.slug}: already correct — skipping.`);
      continue;
    }
    await db
      .update(divisions)
      .set({ name: rename.name, subtitle: rename.subtitle })
      .where(eq(divisions.id, division.id));
    console.log(`  ${rename.slug}: renamed to "${rename.name}".`);
  }

  console.log("\nUpdating product content and division memberships...");
  const validPairs = new Set<string>();
  for (const update of PRODUCT_UPDATES) {
    // Match by the original pre-update name OR the already-updated target name, so a
    // second run (after the rename already happened) still finds the same row.
    const nameMatch = or(eq(products.name, update.matchName), eq(products.name, update.name));
    const whereClauses = update.activeOnly ? and(nameMatch, eq(products.isActive, true)) : nameMatch;
    const [product] = await db.select().from(products).where(whereClauses).limit(1);
    if (!product) {
      console.warn(`  SKIP: product matching "${update.matchName}" not found.`);
      continue;
    }

    const targetDivisionIds: number[] = [];
    for (const slug of update.divisionSlugs) {
      const division = divisionBySlug.get(slug);
      if (!division) {
        console.warn(`  SKIP division "${slug}" for product id ${product.id} — not found.`);
        continue;
      }
      targetDivisionIds.push(division.id);
    }

    await db
      .update(products)
      .set({
        name: update.name,
        spec: update.spec ?? product.spec,
        description: update.description,
        formula: update.formula ?? null,
        purity: update.purity ?? null,
        applications: update.applications,
        ...(update.reactivate ? { isActive: true, deletedAt: null } : {}),
      })
      .where(eq(products.id, product.id));

    await db.delete(productDivisions).where(eq(productDivisions.productId, product.id));
    if (targetDivisionIds.length > 0) {
      await db
        .insert(productDivisions)
        .values(targetDivisionIds.map((divisionId) => ({ productId: product.id, divisionId })));
    }
    for (const divisionId of targetDivisionIds) validPairs.add(`${divisionId}:${product.id}`);

    console.log(`  id ${product.id} "${update.name}": divisions = [${update.divisionSlugs.join(", ")}]`);
  }

  console.log("\nCleaning up stale memberships in restructured divisions...");
  const restructuredIds = RESTRUCTURED_DIVISION_SLUGS.map((slug) => divisionBySlug.get(slug)?.id).filter(
    (id): id is number => id != null,
  );
  const currentRows = await db
    .select()
    .from(productDivisions)
    .where(inArray(productDivisions.divisionId, restructuredIds));
  const staleRows = currentRows.filter((row) => !validPairs.has(`${row.divisionId}:${row.productId}`));
  for (const row of staleRows) {
    await db
      .delete(productDivisions)
      .where(and(eq(productDivisions.productId, row.productId), eq(productDivisions.divisionId, row.divisionId)));
    console.log(`  Removed stale membership: product ${row.productId} <-> division ${row.divisionId}`);
  }
  if (staleRows.length === 0) console.log("  None found.");

  console.log("\n=== Backfill complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
