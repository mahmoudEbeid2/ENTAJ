// Single source of truth for DIVISIONS-page content (divisions, Product Catalog seed
// products, and DIVISIONS-page spec-table rows). Shared by database/seed.ts (fresh
// install) and database/backfill-division-content.ts (idempotent production backfill)
// so the two can never drift apart — that drift (seed.ts gaining new divisions/rows that
// were never re-applied to an already-seeded production DB) is what caused the DIVISIONS
// page to go live missing the Animal Nutrition, Industrial Laundry Detergent, and Glass
// Manufacturing Raw Materials tables.

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

export const categoryDefs: CategoryDef[] = [
  {
    slug: "animal-nutrition",
    name: "Animal Nutrition & Veterinary Raw Materials",
    shortName: "Animal Nutrition",
    iconPath: "/assets/icons/icon-category-feed-additives.png",
    bgColor: "#34C759",
    sortOrder: 0,
  },
  {
    slug: "water-treatment",
    name: "Water Treatment Chemicals",
    shortName: "Water Treatment",
    iconPath: "/assets/icons/icon-category-water-treatment.svg",
    bgColor: "#4EC5F9",
    sortOrder: 1,
  },
  {
    slug: "base-oils",
    name: "Base Oils & Petroleum Products",
    shortName: "Base Oils",
    iconPath: "/assets/icons/icon-category-base-oils.svg",
    bgColor: "#F7DA8D",
    sortOrder: 2,
  },
  {
    slug: "industrial-laundry-detergent",
    name: "Industrial Laundry Detergent",
    shortName: "Industrial Laundry",
    iconPath: "/assets/icons/icon-category-industrial-laundry.svg",
    bgColor: "#FF6060",
    sortOrder: 3,
  },
  {
    slug: "glass-manufacturing-raw-materials",
    name: "Glass Manufacturing Raw Materials",
    shortName: "Glass Manufacturing",
    iconPath: "/assets/icons/icon-category-glass-manufacturing.svg",
    bgColor: "#BEBEBE",
    sortOrder: 4,
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

export const animalNutritionProducts: ProductSeed[] = [
  { name: "Sodium Bicarbonate", spec: "Feed Grade / Food Grade", description: "Rumen buffer, heat stress, electrolytes", imagePath: "products/product-sodium-bicarbonate.webp", isRecommended: true, recommendedSortOrder: 8 },
  { name: "Sodium Carbonate (Soda Ash)", recommendedLabel: "Sodium Carbonate", spec: "Dense / Light", description: "pH regulation, feed processing", imagePath: "products/product-sodium-carbonate.webp", isRecommended: true, isFeatured: true, recommendedSortOrder: 3 },
  { name: "Potassium Chloride", spec: "Min. 96%", description: "Electrolyte formulations", imagePath: "products/product-potassium-chloride.webp", isRecommended: true, recommendedSortOrder: 6 },
  { name: "Magnesium Chloride", spec: "Min. 97%", description: "Mineral supplements, anti-tetany", imagePath: "products/product-magnesium-chloride.webp", isRecommended: true, recommendedSortOrder: 11 },
  { name: "Calcium Chloride", spec: "77% / 94%", description: "Milk fever treatment, mineral balance", imagePath: "products/product-calcium-chloride.webp", isRecommended: true, recommendedSortOrder: 10 },
  { name: "Ammonium Sulfate", spec: "Min. 98%", description: "Non-protein nitrogen for ruminants" },
  { name: "Humic Acid", spec: "Min. 70% Solid", description: "Gut health, mineral absorption", imagePath: "products/product-humic-acid.webp", isRecommended: true, recommendedSortOrder: 9 },
  { name: "Dolomite", spec: "Feed Grade", description: "Calcium & magnesium supplement" },
  { name: "Sodium Chloride", spec: "Min. 99%", description: "Electrolyte, feed mineral" },
  { name: "Bentonite", spec: "Feed Grade", description: "Mycotoxin binder, pellet binder", imagePath: "products/product-bentonite.webp", isRecommended: true, recommendedSortOrder: 7 },
  { name: "S.B.R", imagePath: "products/product-sbr.webp", isRecommended: true, isFeatured: true, recommendedSortOrder: 0 },
];

export const waterTreatmentProducts: ProductSeed[] = [
  { name: "Poly Aluminium Chloride (PAC 18-30%)", recommendedLabel: "Poly Aluminium Chloride", spec: "Drinking Water Grade / Industrial", description: "Coagulation & flocculation, turbidity removal", imagePath: "products/product-poly-aluminium-chloride.webp", isRecommended: true, isFeatured: true, recommendedSortOrder: 1 },
  { name: "Sodium Metabisulphite", recommendedLabel: "Sodium Metabisulfite", spec: "Min. 97%", description: "Dechlorination, RO membrane protection", imagePath: "products/product-sodium-metabisulfite.webp", isRecommended: true, recommendedSortOrder: 4 },
  { name: "Magnesium Hydroxide", spec: "Min. 96%", description: "pH correction, brine treatment", imagePath: "products/product-magnesium-hydroxide.webp", isRecommended: true, isFeatured: true, recommendedSortOrder: 2 },
  { name: "Sodium Hydroxide (Caustic Soda)", recommendedLabel: "Sodium Hydroxide (NaOH)", spec: "Min. 98%", description: "pH adjustment, post-treatment remineralization", imagePath: "products/product-sodium-hydroxide.webp", isRecommended: true, recommendedSortOrder: 5 },
  { name: "Calcium Chloride", spec: "Flakes / 50%", description: "Remineralization of desalinated water" },
  { name: "Sodium Carbonate", spec: "Liquid 77% / 94%", description: "Water softening, alkalinity adjustment" },
  { name: "Antiscalant (BW60 & RO Series)", spec: "Min. 99%", description: "Scale prevention on RO membranes" },
  { name: "Calcium Hypochlorite", spec: "Various / 65–70%", description: "Disinfection & shock chlorination" },
];

export const baseOilsProducts: ProductSeed[] = [
  { name: "Base Oil", spec: "SN 150 / SN 500 / SN 600", description: "Lubricants, industrial oils, transformer oils" },
  { name: "Bitumen", spec: "40/50, 50/70, 60/70, 80/100", description: "Road paving, waterproofing, infrastructure" },
  { name: "Oxidized Bitumen", spec: "75/25, 85/25, 90/15, 115/15", description: "Industrial coating, cable filling, roofing" },
  { name: "Bitumen Emulsion", spec: "SS1, RS1, RS2, MS1, CMS2", description: "Road maintenance, cold-mix applications" },
];

export const productSeedGroups: Array<{ divisionSlug: string; products: ProductSeed[] }> = [
  { divisionSlug: "animal-nutrition", products: animalNutritionProducts },
  { divisionSlug: "water-treatment", products: waterTreatmentProducts },
  { divisionSlug: "base-oils", products: baseOilsProducts },
];

export interface SpecRowSeed {
  name: string;
  spec: string;
  description: string;
  /** Exact Product Catalog name to link this row to, for click-through — omit for rows with no matching catalog product. */
  linkedProductName?: string;
}

export const animalNutritionSpecRows: SpecRowSeed[] = [
  { name: "Sodium Bicarbonate", spec: "Feed Grade / Food Grade", description: "Rumen buffer, heat stress, electrolytes", linkedProductName: "Sodium Bicarbonate" },
  { name: "Sodium Carbonate (Soda Ash)", spec: "Dense / Light", description: "pH regulation, feed processing", linkedProductName: "Sodium Carbonate (Soda Ash)" },
  { name: "Potassium Chloride", spec: "Min. 96%", description: "Electrolyte formulations", linkedProductName: "Potassium Chloride" },
  { name: "Magnesium Chloride", spec: "Min. 97%", description: "Mineral supplements, anti-tetany", linkedProductName: "Magnesium Chloride" },
  { name: "Calcium Chloride", spec: "77% / 94%", description: "Milk fever treatment, mineral balance", linkedProductName: "Calcium Chloride" },
  { name: "Ammonium Sulfate", spec: "Min. 98%", description: "Non-protein nitrogen for ruminants", linkedProductName: "Ammonium Sulfate" },
  { name: "Humic Acid", spec: "Min. 70% Solid", description: "Gut health, mineral absorption", linkedProductName: "Humic Acid" },
  { name: "Dolomite", spec: "Feed Grade", description: "Calcium & magnesium supplement", linkedProductName: "Dolomite" },
  { name: "Sodium Chloride", spec: "Min. 99%", description: "Electrolyte, feed mineral", linkedProductName: "Sodium Chloride" },
  { name: "Bentonite", spec: "Feed Grade", description: "Mycotoxin binder, pellet binder", linkedProductName: "Bentonite" },
];

export const waterTreatmentSpecRows: SpecRowSeed[] = [
  { name: "Poly Aluminium Chloride (PAC 18-30%)", spec: "Drinking Water Grade / Industrial", description: "Coagulation & flocculation, turbidity removal", linkedProductName: "Poly Aluminium Chloride (PAC 18-30%)" },
  { name: "Sodium Metabisulphite", spec: "Min. 97%", description: "Dechlorination, RO membrane protection", linkedProductName: "Sodium Metabisulphite" },
  { name: "Magnesium Hydroxide", spec: "Min. 96%", description: "pH correction, brine treatment", linkedProductName: "Magnesium Hydroxide" },
  { name: "Sodium Hydroxide (Caustic Soda)", spec: "Min. 98%", description: "pH adjustment, post-treatment remineralization", linkedProductName: "Sodium Hydroxide (Caustic Soda)" },
  { name: "Calcium Chloride", spec: "Flakes / 50%", description: "Remineralization of desalinated water", linkedProductName: "Calcium Chloride" },
  { name: "Sodium Carbonate", spec: "Liquid 77% / 94%", description: "Water softening, alkalinity adjustment", linkedProductName: "Sodium Carbonate" },
  { name: "Antiscalant (BW60 & RO Series)", spec: "Min. 99%", description: "Scale prevention on RO membranes", linkedProductName: "Antiscalant (BW60 & RO Series)" },
  { name: "Calcium Hypochlorite", spec: "Various / 65-70%", description: "Disinfection & shock chlorination", linkedProductName: "Calcium Hypochlorite" },
];

export const baseOilsSpecRows: SpecRowSeed[] = [
  { name: "Base Oil", spec: "SN 150 / SN 500 / SN 600", description: "Lubricants, industrial oils, transformer oils", linkedProductName: "Base Oil" },
  { name: "Bitumen", spec: "40/50, 50/70, 60/70, 80/100", description: "Road paving, waterproofing, infrastructure", linkedProductName: "Bitumen" },
  { name: "Oxidized Bitumen", spec: "75/25, 85/25, 90/15, 115/15", description: "Industrial coating, cable filling, roofing", linkedProductName: "Oxidized Bitumen" },
  { name: "Bitumen Emulsion", spec: "SS1, RS1, RS2, MS1, CMS2", description: "Road maintenance, cold-mix applications", linkedProductName: "Bitumen Emulsion" },
];

// Industrial Laundry Detergent and Glass Manufacturing Raw Materials have no Product
// Catalog items yet — these two divisions' Figma table rows are DIVISIONS-page content
// only (not linked to any catalog product) until an admin adds real catalog products.
export const industrialLaundrySpecRows: SpecRowSeed[] = [
  { name: "Base Oil", spec: "SN 150 / SN 500 / SN 600", description: "Lubricants, industrial oils, transformer oils" },
  { name: "Bitumen", spec: "40/50, 50/70, 60/70, 80/100", description: "Road paving, waterproofing, infrastructure" },
];

export const glassManufacturingSpecRows: SpecRowSeed[] = [
  { name: "Base Oil", spec: "SN 150 / SN 500 / SN 600", description: "Lubricants, industrial oils, transformer oils" },
  { name: "Bitumen", spec: "40/50, 50/70, 60/70, 80/100", description: "Road paving, waterproofing, infrastructure" },
];

export const specRowGroups: Array<{ divisionSlug: string; rows: SpecRowSeed[] }> = [
  { divisionSlug: "animal-nutrition", rows: animalNutritionSpecRows },
  { divisionSlug: "water-treatment", rows: waterTreatmentSpecRows },
  { divisionSlug: "base-oils", rows: baseOilsSpecRows },
  { divisionSlug: "industrial-laundry-detergent", rows: industrialLaundrySpecRows },
  { divisionSlug: "glass-manufacturing-raw-materials", rows: glassManufacturingSpecRows },
];
