// Single source of truth for DIVISIONS-page content (divisions, Product Catalog seed
// products, and DIVISIONS-page spec-table rows). Shared by database/seed.ts (fresh
// install) and database/backfill-division-content.ts (idempotent production backfill)
// so the two can never drift apart.
//
// categoryDefs/productSeedGroups/specRowGroups are intentionally empty — all 5
// divisions (Animal Nutrition, Water Treatment, Base Oils, Industrial Laundry
// Detergent, Glass Manufacturing) were removed from the DIVISIONS page. Already-seeded
// databases are untouched by this file; remove those categories via /admin/categories
// if they need to come out of a running database too.

export interface HomeDivisionDef {
  slug: string;
  name: string;
  subtitle: string;
  numeral: string;
  imagePath: string;
  href: string;
  ctaLabel: string;
  sortOrder: number;
}

export const homeDivisionDefs: HomeDivisionDef[] = [
  {
    slug: "animal-nutrition",
    name: "Animal Nutrition & Veterinary Raw Materials",
    subtitle: "The Building Blocks of Animal Health Start Here",
    numeral: "Division 1",
    imagePath: "categories/division-animal-nutrition.png",
    href: "/divisions#animal-nutrition",
    ctaLabel: "GO TO PRODUCTS",
    sortOrder: 0,
  },
  {
    slug: "water-treatment",
    name: "Water Treatment Chemicals",
    subtitle: "Clean Water Demands Reliable Chemistry.",
    numeral: "Division 2",
    imagePath: "categories/division-water-treatment.png",
    href: "/divisions#water-treatment",
    ctaLabel: "GO TO PRODUCTS",
    sortOrder: 1,
  },
  {
    slug: "base-oils",
    name: "Base Oils & Petroleum Products",
    subtitle: "Precision-Grade Base Oils for Industrial Applications.",
    numeral: "Division 3",
    imagePath: "categories/division-base-oils.png",
    href: "/divisions#base-oils",
    ctaLabel: "GO TO PRODUCTS",
    sortOrder: 2,
  },
];

export interface CategoryDef {
  slug: string;
  name: string;
  shortName: string;
  iconPath?: string;
  bgColor?: string;
  sortOrder: number;
}

export const categoryDefs: CategoryDef[] = [];

export type DivisionDef = CategoryDef;
export const divisionDefs = categoryDefs;


export interface ProductSeed {
  name: string;
  recommendedLabel?: string;
  spec?: string;
  description?: string;
  imagePath?: string;
  isRecommended?: boolean;
  isFeatured?: boolean;
  recommendedSortOrder?: number;
}

export const productSeedGroups: Array<{ divisionSlug: string; products: ProductSeed[] }> = [];

export interface SpecRowSeed {
  name: string;
  spec: string;
  description: string;
  /** Exact Product Catalog name to link this row to, for click-through — omit for rows with no matching catalog product. */
  linkedProductName?: string;
}

export const specRowGroups: Array<{ divisionSlug: string; rows: SpecRowSeed[] }> = [];
