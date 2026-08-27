import { describe, expect, it } from "vitest";
import { filterDivisionsWithTableContent } from "./division-table-content";

// Regression test for the DIVISIONS-page production bug: a division's spec table must
// render whenever it has its own division_spec_rows content, regardless of Product
// Catalog state (product count, isActive, isRecommended, isFeatured, spec, images, etc).
// Rendering must never be conditioned on the Product Catalog — that exact mistake (via
// getDivisionsWithProducts()/products.filter(...)) caused Industrial Laundry Detergent,
// Glass Manufacturing Raw Materials, and Animal Nutrition to disappear from production
// even though their DIVISIONS-page table content existed.
describe("filterDivisionsWithTableContent", () => {
  it("renders a division with table content and ZERO Product Catalog products", () => {
    // Realistic fixture: Industrial Laundry Detergent has no products in the catalog yet,
    // only DIVISIONS-page spec rows (see database/seed-data/divisions.ts).
    const industrialLaundry = {
      id: 4,
      slug: "industrial-laundry-detergent",
      name: "Industrial Laundry Detergent",
      products: [] as unknown[], // 0 Product Catalog records
      specRows: [
        { id: 1, name: "Base Oil", spec: "SN 150 / SN 500 / SN 600", description: "Lubricants, industrial oils, transformer oils" },
        { id: 2, name: "Bitumen", spec: "40/50, 50/70, 60/70, 80/100", description: "Road paving, waterproofing, infrastructure" },
      ],
    };

    const result = filterDivisionsWithTableContent([industrialLaundry]);

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("industrial-laundry-detergent");
  });

  it("excludes a division with no DIVISIONS-page table content, even with Product Catalog products", () => {
    // The inverse case: lots of catalog products, but no divisionSpecRows content yet —
    // must NOT render, since there is nothing for the table to show.
    const divisionWithOnlyProducts = {
      id: 5,
      slug: "some-new-division",
      name: "Some New Division",
      products: [{ id: 1, name: "Widget", isActive: true }],
      specRows: [] as unknown[],
    };

    const result = filterDivisionsWithTableContent([divisionWithOnlyProducts]);

    expect(result).toHaveLength(0);
  });

  it("does not require a `products` field at all to make its decision", () => {
    // The rendering condition must be computable from specRows alone — proving the
    // function has no structural dependency on Product Catalog data.
    const withoutProductsField = {
      id: 1,
      slug: "animal-nutrition",
      specRows: [{ id: 1, name: "Sodium Bicarbonate", spec: "Feed Grade / Food Grade", description: "Rumen buffer" }],
    };

    const result = filterDivisionsWithTableContent([withoutProductsField]);

    expect(result).toHaveLength(1);
  });

  it("ensures Categories and Tables are completely independent from Home Divisions", () => {
    // Zero Home Divisions present
    const homeDivisions: unknown[] = [];
    const categories = [
      { id: 1, slug: "animal-nutrition", name: "Animal Nutrition", specRows: [{ id: 1, name: "Sodium Bicarbonate" }] },
      { id: 2, slug: "water-treatment", name: "Water Treatment", specRows: [{ id: 2, name: "PAC" }] },
      { id: 3, slug: "base-oils", name: "Base Oils", specRows: [{ id: 3, name: "Base Oil" }] },
      { id: 4, slug: "industrial-laundry-detergent", name: "Industrial Laundry", specRows: [{ id: 4, name: "Base Oil" }] },
      { id: 5, slug: "glass-manufacturing-raw-materials", name: "Glass Manufacturing", specRows: [{ id: 5, name: "Base Oil" }] },
    ];

    expect(homeDivisions).toHaveLength(0);
    // Categories & tables still have all 5 items regardless of 0 home divisions
    const visibleTables = filterDivisionsWithTableContent(categories);
    expect(visibleTables).toHaveLength(5);
  });
});

