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
  subtitle?: string;
  description?: string;
  iconPath?: string;
  bgColor?: string;
  sortOrder: number;
}

// Safety Equipment & PPE (Figma file wg2m7NxmAMBvUlAk7DA2vB, node 75:5 "Page 5") — seeded
// directly here rather than created through /admin/categories, per explicit request: this
// category's content is pixel-sourced from Figma and should render from seed data, not be
// hand-entered in the admin UI (it remains editable there afterward like any other category).
export const categoryDefs: CategoryDef[] = [
  {
    slug: "safety-equipment-ppe",
    name: "Safety Equipment & PPE",
    shortName: "Safety & PPE",
    subtitle: "Reliable Protection for Every Working Environment",
    description:
      "ENTAJ provides reliable personal protective equipment and industrial safety solutions designed to protect workers across construction, manufacturing, oil and gas, logistics, and other demanding work environments.",
    iconPath: "/assets/icons/icon-ppe-intro-shield.svg",
    bgColor: "#2C388E",
    sortOrder: 0,
  },
];

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
  spec?: string;
  description: string;
  iconPath?: string;
  /** Exact Product Catalog name to link this row to, for click-through — omit for rows with no matching catalog product. */
  linkedProductName?: string;
}

export const specRowGroups: Array<{ divisionSlug: string; rows: SpecRowSeed[] }> = [
  {
    divisionSlug: "safety-equipment-ppe",
    rows: [
      {
        name: "Head Protection",
        description: "Safety Helmets and Bump Caps",
        iconPath: "/assets/icons/icon-ppe-head-protection.svg",
      },
      {
        name: "Eye & Face Protection",
        description: "Safety Glasses, Goggles and Face Shields",
        iconPath: "/assets/icons/icon-ppe-eye-face-protection.svg",
      },
      {
        name: "Hand Protection",
        description: "Industrial, Chemical-Resistant and Cut-Resistant Gloves",
        iconPath: "/assets/icons/icon-ppe-hand-protection.svg",
      },
      {
        name: "Respiratory Protection",
        description: "Masks, Respirators, Filters and Cartridges",
        iconPath: "/assets/icons/icon-ppe-respiratory-protection.svg",
      },
      {
        name: "Hearing Protection",
        description: "Earplugs and Earmuffs",
        iconPath: "/assets/icons/icon-ppe-hearing-protection.svg",
      },
      {
        name: "Foot Protection",
        description: "Safety Shoes and Protective Boots",
        iconPath: "/assets/icons/icon-ppe-foot-protection.svg",
      },
      {
        name: "Protective Clothing",
        description: "Coveralls, Reflective Vests and Chemical-Resistant Suits",
        iconPath: "/assets/icons/icon-ppe-protective-clothing.svg",
      },
      {
        name: "Fall Protection",
        description: "Safety Harnesses, Lanyards and Lifelines",
        iconPath: "/assets/icons/icon-ppe-fall-protection.svg",
      },
      {
        name: "Workplace Safety",
        description: "Safety Signs, Cones, Barriers, First Aid Kits and Spill Kits",
        iconPath: "/assets/icons/icon-ppe-workplace-safety.svg",
      },
    ],
  },
];
