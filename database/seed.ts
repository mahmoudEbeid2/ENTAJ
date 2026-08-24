import { existsSync, readdirSync, statSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  activityLogs,
  admins,
  blogCategories,
  blogPosts,
  contactMessages,
  ctaPanels,
  divisions,
  faqs,
  heroSlides,
  marketRegions,
  mediaLibrary,
  navItems,
  offices,
  pages,
  pageSections,
  partners,
  permissions,
  products,
  roles,
  rolePermissions,
  seoMeta,
  services,
  siteSettings,
  socialLinks,
  stats,
  testimonials,
  valueProps,
  whyUsFeatures,
} from "@/database/schema";

const ROOT = process.cwd();
const STORAGE_ROOT = path.resolve(ROOT, process.env.STORAGE_ROOT || "storage");
const REFERENCE_ROOT = path.resolve(ROOT, "database/seed-assets/reference");
const MANIFEST_DIR = path.resolve(ROOT, "database/seed-assets");

const SKIP_CATEGORIES = new Set(["not-an-asset", "reference-not-shipped", "unresolved"]);

function resolveManifestPath(destPath: string): string {
  if (destPath.startsWith("public/")) return path.join(ROOT, destPath);
  if (destPath.startsWith("../reference/")) {
    return path.join(REFERENCE_ROOT, destPath.replace("../reference/", ""));
  }
  return path.join(STORAGE_ROOT, destPath);
}

async function validateManifestAssets(): Promise<void> {
  const manifestFiles = readdirSync(MANIFEST_DIR).filter((f) => f.endsWith(".json"));
  const missing: string[] = [];
  let checked = 0;

  for (const file of manifestFiles) {
    const raw = await readFile(path.join(MANIFEST_DIR, file), "utf8");
    const entries: Array<{ destPath?: string | null; category?: string; figmaName?: string }> =
      JSON.parse(raw);

    for (const entry of entries) {
      if (!entry.destPath) continue;
      if (entry.category && SKIP_CATEGORIES.has(entry.category)) continue;
      checked++;
      const resolved = resolveManifestPath(entry.destPath);
      if (!existsSync(resolved)) {
        missing.push(`${file} -> "${entry.figmaName ?? entry.destPath}" (expected at ${resolved})`);
      }
    }
  }

  console.log(`Asset validation: ${checked} referenced assets checked across ${manifestFiles.length} manifests.`);

  if (missing.length > 0) {
    console.error("\nSEED ABORTED — missing assets referenced by the Figma manifests:\n");
    for (const m of missing) console.error("  - " + m);
    console.error(
      "\nRe-run the asset export for the missing files before seeding. Refusing to seed with placeholder images.",
    );
    process.exit(1);
  }

  console.log("All manifest-referenced assets are present on disk.\n");
}

function mimeFromExt(ext: string): string {
  return (
    {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    }[ext.toLowerCase()] ?? "application/octet-stream"
  );
}

function assertAdminEnv(): { email: string; password: string } {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error(
      "\nSEED ABORTED — ADMIN_EMAIL and ADMIN_PASSWORD must both be set (in .env) before seeding.\n" +
        "These credentials are required to create the initial admin account and are never hardcoded.",
    );
    process.exit(1);
  }
  return { email, password };
}

async function upsertAdmin(email: string, password: string, roleId: number): Promise<number> {
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await db.select().from(admins).where(eq(admins.email, email)).limit(1);

  if (existing.length > 0) {
    await db
      .update(admins)
      .set({ passwordHash, roleId, isActive: true })
      .where(eq(admins.email, email));
    console.log(`  Admin "${email}" already existed — synced role/password hash, no duplicate created.`);
    return existing[0].id;
  }

  await db.insert(admins).values({
    name: "ENTAJ Admin",
    email,
    passwordHash,
    roleId,
    isActive: true,
  });
  const [created] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  console.log(`  Created admin "${email}".`);
  return created.id;
}

function walkStorageFiles(): Array<{ diskPath: string; absolute: string; category: string }> {
  const results: Array<{ diskPath: string; absolute: string; category: string }> = [];
  if (!existsSync(STORAGE_ROOT)) return results;
  for (const category of readdirSync(STORAGE_ROOT)) {
    const categoryDir = path.join(STORAGE_ROOT, category);
    if (!statSync(categoryDir).isDirectory()) continue;
    for (const file of readdirSync(categoryDir)) {
      if (file === ".gitkeep") continue;
      results.push({
        diskPath: `${category}/${file}`,
        absolute: path.join(categoryDir, file),
        category,
      });
    }
  }
  return results;
}

async function main() {
  console.log("=== ENTAJ database seed ===\n");
  const { email: adminEmail, password: adminPassword } = assertAdminEnv();

  const alreadySeeded = (await db.select().from(siteSettings).limit(1)).length > 0;
  if (alreadySeeded) {
    console.log("Database already seeded (site_settings has rows) — syncing admin credentials only.\n");
    const [superAdminRole] = await db.select().from(roles).where(eq(roles.slug, "super-admin")).limit(1);
    if (!superAdminRole) {
      throw new Error("Database is partially seeded: site_settings exists but the 'super-admin' role does not.");
    }
    await upsertAdmin(adminEmail, adminPassword, superAdminRole.id);
    console.log("\n=== Seed skipped (already initialized); admin sync complete ===");
    process.exit(0);
  }

  await validateManifestAssets();

  console.log("Seeding roles & permissions...");
  const permissionDefs = [
    { name: "Manage Users", slug: "manage-users" },
    { name: "Manage Content", slug: "manage-content" },
    { name: "Manage Products", slug: "manage-products" },
    { name: "Manage Media", slug: "manage-media" },
    { name: "Manage Settings", slug: "manage-settings" },
    { name: "View Messages", slug: "view-messages" },
    { name: "Manage Messages", slug: "manage-messages" },
  ];
  await db.insert(permissions).values(permissionDefs);
  const insertedPermissions = await db.select().from(permissions);

  const roleDefs = [
    { name: "Super Admin", slug: "super-admin", description: "Full access to all admin features" },
    { name: "Editor", slug: "editor", description: "Manage content, products and media" },
  ];
  await db.insert(roles).values(roleDefs);
  const insertedRoles = await db.select().from(roles);
  const superAdminRole = insertedRoles.find((r) => r.slug === "super-admin")!;
  const editorRole = insertedRoles.find((r) => r.slug === "editor")!;

  await db.insert(rolePermissions).values(
    insertedPermissions.map((p) => ({ roleId: superAdminRole.id, permissionId: p.id })),
  );
  const editorPermissionSlugs = new Set([
    "manage-content",
    "manage-products",
    "manage-media",
    "view-messages",
    "manage-messages",
  ]);
  await db.insert(rolePermissions).values(
    insertedPermissions
      .filter((p) => editorPermissionSlugs.has(p.slug))
      .map((p) => ({ roleId: editorRole.id, permissionId: p.id })),
  );

  console.log("Seeding initial admin user...");
  const seedAdminId = await upsertAdmin(adminEmail, adminPassword, superAdminRole.id);
  const seedAdmin = { id: seedAdminId };
  console.log(`  Admin login: ${adminEmail} (password from ADMIN_PASSWORD env var, never logged)\n`);

  console.log("Seeding site settings, nav, social links, offices, SEO...");
  await db.insert(siteSettings).values({
    siteName: "ENTAJ",
    tagline: "Raw Materials. Real Expertise. Reliable Supply.",
    footerTagline:
      "Entaj — Raw Materials. Real Expertise. Reliable Supply. A member of HS Group Ltd | Est. 2012",
    establishedYear: "2012",
    parentCompany: "HS Group Ltd",
    logoPath: "settings/logo-white.svg",
    logoLockupPath: "settings/logo-lockup-tagline.png",
    footerLogoPath: "settings/logo-lockup-tagline-white.png",
    faviconPath: null,
    contactEmail: "info@entaj.co",
    contactWebsite: "entaj.co",
    contactPhone: null,
  });

  await db.insert(offices).values([
    {
      label: "Amman, Jordan",
      address: "Amman, Jordan",
      flagIconPath: "/assets/icons/flag-jordan.svg",
      isPrimary: true,
      sortOrder: 0,
    },
    {
      label: "İzmir Free Trade Zone, Turkey",
      address: "İzmir Free Trade Zone, Turkey",
      flagIconPath: "/assets/icons/flag-turkey.svg",
      isPrimary: false,
      sortOrder: 1,
    },
  ]);

  await db.insert(socialLinks).values([
    { platform: "facebook", url: "#", isActive: true, sortOrder: 0 },
    { platform: "instagram", url: "#", isActive: true, sortOrder: 1 },
    { platform: "linkedin", url: "#", isActive: true, sortOrder: 2 },
    { platform: "youtube", url: "#", isActive: true, sortOrder: 3 },
  ]);

  const navDefs = [
    { label: "HOME", href: "/" },
    { label: "DIVISIONS", href: "/divisions" },
    { label: "CONTACT US", href: "/contact" },
    { label: "ABOUT US", href: "/about" },
  ];
  await db.insert(navItems).values([
    ...navDefs.map((n, i) => ({ ...n, menuKey: "header" as const, sortOrder: i })),
    ...navDefs.map((n, i) => ({ ...n, menuKey: "footer" as const, sortOrder: i })),
  ]);

  await db.insert(seoMeta).values([
    {
      pageSlug: "home",
      title: "ENTAJ — Raw Materials That Power Industries",
      description:
        "From animal nutrition to water purification and base oils, Entaj delivers premium raw materials backed by 12+ years of sourcing expertise, global supply networks, and uncompromising quality standards.",
    },
    {
      pageSlug: "about",
      title: "About ENTAJ — Raw Materials. Real Expertise. Reliable Supply.",
      description:
        "A Jordanian-based specialty raw materials company, part of HS Group Ltd — a diversified manufacturing and investment group with facilities in Jordan and Turkey.",
    },
    {
      pageSlug: "divisions",
      title: "Our Divisions & Products — ENTAJ",
      description:
        "Explore ENTAJ's Animal Nutrition, Water Treatment, and Base Oils product divisions — sourced from ISO 9001, ISO 22000, HALAL, and SGS-verified manufacturers.",
    },
    {
      pageSlug: "contact",
      title: "Contact ENTAJ",
      description: "Tell us about your material needs. We respond with availability, pricing, and documentation within 24 hours.",
    },
  ]);

  console.log("Seeding divisions...");
  const divisionDefs = [
    {
      slug: "animal-nutrition",
      name: "Animal Nutrition & Veterinary Raw Materials",
      shortName: "Animal Nutrition",
      subtitle: "The Building Blocks of Animal Health Start Here",
      numeral: "Division 1",
      imagePath: "categories/division-animal-nutrition.png",
      sortOrder: 0,
    },
    {
      slug: "water-treatment",
      name: "Water Treatment Chemicals",
      shortName: "Water Treatment",
      subtitle: "Clean Water Demands Reliable Chemistry.",
      numeral: "Division 2",
      imagePath: "categories/division-water-treatment.png",
      sortOrder: 1,
    },
    {
      slug: "base-oils",
      name: "Base Oils & Petroleum Products",
      shortName: "Base Oils",
      subtitle: "Precision-Grade Base Oils for Industrial Applications.",
      numeral: "Division 3",
      imagePath: "categories/division-base-oils.png",
      sortOrder: 2,
    },
    // Figma reserves these two as future divisions (heading + category-nav card only —
    // their spec-table rows in the design are a copy-pasted placeholder of the Base Oils
    // table, not real product data). Seeded inactive with no products until an admin fills
    // in real content; kept out of the Home page division carousel and public catalog until then.
    {
      slug: "industrial-laundry-detergent",
      name: "Industrial Laundry Detergent",
      shortName: "Industrial Laundry",
      sortOrder: 3,
      isActive: false,
    },
    {
      slug: "glass-manufacturing-raw-materials",
      name: "Glass Manufacturing Raw Materials",
      shortName: "Glass Manufacturing",
      sortOrder: 4,
      isActive: false,
    },
  ];
  await db.insert(divisions).values(divisionDefs);
  const insertedDivisions = await db.select().from(divisions);
  const divisionBySlug = (slug: string) => insertedDivisions.find((d) => d.slug === slug)!;

  console.log("Seeding products (catalog + recommended)...");
  interface ProductSeed {
    name: string;
    recommendedLabel?: string;
    spec?: string;
    description?: string;
    imagePath?: string;
    isRecommended?: boolean;
    isFeatured?: boolean;
    recommendedSortOrder?: number;
  }
  const animalNutritionProducts: ProductSeed[] = [
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
  const waterTreatmentProducts: ProductSeed[] = [
    { name: "Poly Aluminium Chloride (PAC 18-30%)", recommendedLabel: "Poly Aluminium Chloride", spec: "Drinking Water Grade / Industrial", description: "Coagulation & flocculation, turbidity removal", imagePath: "products/product-poly-aluminium-chloride.webp", isRecommended: true, isFeatured: true, recommendedSortOrder: 1 },
    { name: "Sodium Metabisulphite", recommendedLabel: "Sodium Metabisulfite", spec: "Min. 97%", description: "Dechlorination, RO membrane protection", imagePath: "products/product-sodium-metabisulfite.webp", isRecommended: true, recommendedSortOrder: 4 },
    { name: "Magnesium Hydroxide", spec: "Min. 96%", description: "pH correction, brine treatment", imagePath: "products/product-magnesium-hydroxide.webp", isRecommended: true, isFeatured: true, recommendedSortOrder: 2 },
    { name: "Sodium Hydroxide (Caustic Soda)", recommendedLabel: "Sodium Hydroxide (NaOH)", spec: "Min. 98%", description: "pH adjustment, post-treatment remineralization", imagePath: "products/product-sodium-hydroxide.webp", isRecommended: true, recommendedSortOrder: 5 },
    { name: "Calcium Chloride", spec: "Flakes / 50%", description: "Remineralization of desalinated water" },
    { name: "Sodium Carbonate", spec: "Liquid 77% / 94%", description: "Water softening, alkalinity adjustment" },
    { name: "Antiscalant (BW60 & RO Series)", spec: "Min. 99%", description: "Scale prevention on RO membranes" },
    { name: "Calcium Hypochlorite", spec: "Various / 65–70%", description: "Disinfection & shock chlorination" },
  ];
  const baseOilsProducts: ProductSeed[] = [
    { name: "Base Oil", spec: "SN 150 / SN 500 / SN 600", description: "Lubricants, industrial oils, transformer oils" },
    { name: "Bitumen", spec: "40/50, 50/70, 60/70, 80/100", description: "Road paving, waterproofing, infrastructure" },
    { name: "Oxidized Bitumen", spec: "75/25, 85/25, 90/15, 115/15", description: "Industrial coating, cable filling, roofing" },
    { name: "Bitumen Emulsion", spec: "SS1, RS1, RS2, MS1, CMS2", description: "Road maintenance, cold-mix applications" },
  ];

  const productRows = [
    ...animalNutritionProducts.map((p, i) => ({
      divisionId: divisionBySlug("animal-nutrition").id,
      name: p.name,
      recommendedLabel: p.recommendedLabel ?? null,
      spec: p.spec ?? null,
      description: p.description ?? null,
      imagePath: p.imagePath ?? null,
      isRecommended: p.isRecommended ?? false,
      isFeatured: p.isFeatured ?? false,
      recommendedSortOrder: p.recommendedSortOrder ?? null,
      sortOrder: i,
    })),
    ...waterTreatmentProducts.map((p, i) => ({
      divisionId: divisionBySlug("water-treatment").id,
      name: p.name,
      recommendedLabel: p.recommendedLabel ?? null,
      spec: p.spec ?? null,
      description: p.description ?? null,
      imagePath: p.imagePath ?? null,
      isRecommended: p.isRecommended ?? false,
      isFeatured: p.isFeatured ?? false,
      recommendedSortOrder: p.recommendedSortOrder ?? null,
      sortOrder: i,
    })),
    ...baseOilsProducts.map((p, i) => ({
      divisionId: divisionBySlug("base-oils").id,
      name: p.name,
      recommendedLabel: p.recommendedLabel ?? null,
      spec: p.spec ?? null,
      description: p.description ?? null,
      imagePath: p.imagePath ?? null,
      isRecommended: p.isRecommended ?? false,
      isFeatured: p.isFeatured ?? false,
      recommendedSortOrder: p.recommendedSortOrder ?? null,
      sortOrder: i,
    })),
  ];
  await db.insert(products).values(productRows);

  console.log("Seeding home hero slides...");
  await db.insert(heroSlides).values([
    {
      page: "home",
      title: "Raw Materials That Power Industries",
      subtitle:
        "From animal nutrition to water purification and base oils Entaj delivers premium raw materials backed by 12+ years of sourcing expertise, global supply networks, and uncompromising quality standards.",
      imagePath: "pages/home-hero-1.png",
      ctaPrimaryLabel: "Request a Quote",
      ctaPrimaryHref: "/contact",
      ctaSecondaryLabel: "Explore Our Products",
      ctaSecondaryHref: "/divisions",
      sortOrder: 0,
    },
    { page: "home", title: "Raw Materials That Power Industries", imagePath: "pages/home-hero-2.png", sortOrder: 1 },
    { page: "home", title: "Raw Materials That Power Industries", imagePath: "pages/home-hero-3.png", sortOrder: 2 },
  ]);
  await db.insert(heroSlides).values([
    { page: "about", title: "ABOUT US", imagePath: "pages/about-hero.png", sortOrder: 0 },
    { page: "divisions", title: "DIVISIONS", imagePath: "pages/divisions-hero.png", sortOrder: 0 },
    { page: "contact", title: "CONTACT US", imagePath: "pages/contact-hero.webp", sortOrder: 0 },
  ]);

  console.log("Seeding stats...");
  await db.insert(stats).values([
    { page: "home", variant: "counter", value: "12+", label: "Country served", iconPath: "/assets/icons/stat-icon-country.svg", sortOrder: 0 },
    { page: "home", variant: "counter", value: "20+", label: "Years of experience", iconPath: "/assets/icons/stat-icon-experience.svg", sortOrder: 1 },
    { page: "home", variant: "counter", value: "100+", label: "Raw materials", iconPath: "/assets/icons/stat-icon-materials.svg", sortOrder: 2 },
    { page: "home", variant: "counter", value: "ISO", label: "Certified", iconPath: "/assets/icons/stat-icon-certified.svg", sortOrder: 3 },
    { page: "about", variant: "timeline", value: "2012", label: "Founded", sortOrder: 0 },
    { page: "about", variant: "timeline", value: "2", label: "Countries with facilities", sortOrder: 1 },
    { page: "about", variant: "timeline", value: "20+", label: "Markets reached", sortOrder: 2 },
    { page: "about", variant: "timeline", value: "3", label: "Core divisions", sortOrder: 3 },
  ]);

  console.log("Seeding value props, why-us features, market regions...");
  const valuePropDefs = [
    {
      title: "Deep Industry Roots",
      description:
        "Since 2012, we have been embedded in the animal health, feed additive, and industrial chemicals sectors. This gives us sourcing intelligence and supplier relationships that generalist traders simply cannot match.",
      aboutTitle: "Deep industry roots",
      aboutDescription:
        "Embedded in animal health, feed additive, and industrial chemicals since 2012 — sourcing intelligence generalist traders can't match.",
      homeIconPath: "/assets/icons/value-prop-deep-industry-roots.svg",
      aboutIconPath: "/assets/icons/about-value-prop-icon-1.svg",
    },
    {
      title: "Integrated Group Infrastructure",
      description:
        "As part of HS Group, we leverage manufacturing facilities in Jordan and Turkey, an industrial investment license in Saudi Arabia, and an active distribution network spanning 20+ countries across Africa, Asia, and the Gulf.",
      aboutTitle: "Integrated group infrastructure",
      aboutDescription:
        "Manufacturing in Jordan and Turkey, an industrial license in Saudi Arabia, and a distribution network across 20+ countries.",
      homeIconPath: "/assets/icons/value-prop-integrated-infrastructure.svg",
      aboutIconPath: "/assets/icons/about-value-prop-icon-2.png",
    },
    {
      title: "Quality Without Compromise",
      description:
        "Every material we supply is accompanied by full technical documentation — Certificate of Analysis (COA), Technical Data Sheet (TDS), and Safety Data Sheet (SDS). We work exclusively with manufacturers who hold internationally recognized certifications including ISO 9001, ISO 22000, HALAL, and SGS-verified compliance.",
      aboutTitle: "Quality without compromise",
      aboutDescription:
        "Every material comes with COA, TDS, and SDS — sourced only from ISO 9001, ISO 22000, HALAL, and SGS-verified manufacturers.",
      homeIconPath: "/assets/icons/value-prop-quality-compromise.svg",
      aboutIconPath: "/assets/icons/about-value-prop-icon-3.png",
    },
    {
      title: "Transparent Partnerships",
      description:
        "We believe long-term business is built on honesty. We tell you what a material can and cannot do — before you commit.",
      aboutTitle: "Transparent partnerships",
      aboutDescription: "We tell you what a material can and cannot do — before you commit.",
      homeIconPath: "/assets/icons/value-prop-transparent-partnerships.svg",
      aboutIconPath: "/assets/icons/about-value-prop-icon-4.svg",
    },
  ];
  await db.insert(valueProps).values(valuePropDefs.map((v, i) => ({ ...v, sortOrder: i })));

  await db.insert(whyUsFeatures).values([
    { number: 1, title: "Verified Supply Chain", description: "We do not guess. Every product we supply comes with documented origin, certified analysis, and a clear chain of custody. No surprises at your lab or your border.", imagePath: "pages/why-entaj-1-verified-supply-chain.png", sortOrder: 0 },
    { number: 2, title: "Flexible Quantities & Packaging", description: "We do not guess. Every product we supply comes with documented origin, certified analysis, and a clear chain of custody. No surprises at your lab or your border.", imagePath: "pages/why-entaj-2-flexible-quantities.png", sortOrder: 1 },
    { number: 3, title: "Technical Depth", description: "Our team understands the end-use applications of the materials we sell. We speak the same language as your production chemists, QC managers, and procurement directors.", imagePath: "pages/why-entaj-3-technical-depth.png", sortOrder: 2 },
    { number: 4, title: "Regulatory Documentation", description: "COA. TDS. SDS. HALAL certificates. ISO compliance documentation. REACH registration numbers. We prepare your complete documentation package so your import and QC process runs smoothly.", imagePath: "pages/why-entaj-4-regulatory-documentation.png", sortOrder: 3 },
    { number: 5, title: "Competitive Pricing Through Direct Sourcing", description: "By sourcing directly from manufacturers in Turkey, Iran, India, and China — and leveraging the logistical infrastructure of HS Group - we consistently deliver below-market pricing without compromising specification.", imagePath: "pages/why-entaj-5-competitive-pricing.png", sortOrder: 4 },
    { number: 6, title: "Active in Your Markets", description: "We are not a distant trading desk. We have operational presence and established customer relationships in Jordan, Saudi Arabia, the UAE, Kenya, Tanzania, Uganda, Ethiopia, Pakistan, and Bangladesh. We understand the logistics, the regulations, and the business culture of the markets we serve.", imagePath: "pages/why-entaj-6-active-in-markets.png", sortOrder: 5 },
  ]);

  await db.insert(marketRegions).values([
    { name: "Middle East & Gulf", countries: "Jordan | Saudi Arabia | UAE | Iraq | Kuwait | Qatar", sortOrder: 0 },
    { name: "East Africa", countries: "Kenya | Tanzania | Uganda | Ethiopia | Sierra Leone | Rwanda", sortOrder: 1 },
    { name: "South & Southeast Asia", countries: "Pakistan | Bangladesh | Indonesia | Malaysia", sortOrder: 2 },
    { name: "North Africa", countries: "Egypt | Libya | Algeria", sortOrder: 3 },
  ]);

  console.log("Seeding CTA panels and page sections...");
  await db.insert(ctaPanels).values([
    {
      key: "quality_compliance",
      variant: "dark",
      heading: "QUALITY & COMPLIANCE",
      body: "At Entaj, quality is not a department. It is a sourcing philosophy.\n\nEvery supplier in our network undergoes a structured qualification process before we place a single order. We evaluate:\n\n• Manufacturing certifications (ISO 9001, ISO 22000, HALAL, SGS)\n• Laboratory analysis vs. published specification\n• Stability of supply and historical on-time delivery\n• Environmental and regulatory compliance in the country of origin\n\nWe maintain a library of current COAs, SDS files, and technical data sheets for every product in our portfolio — available to qualified buyers upon request.",
      iconPath: "/assets/icons/icon-quality-compliance.svg",
    },
    {
      key: "home_contact_cta",
      variant: "light",
      heading: "CONTACT US",
      subheading: "Let's Talk About What You Need.",
      body: "Whether you are qualifying a new supplier, looking for a better price on an existing material, or exploring a new product category we are ready to have a technical and commercial conversation. Send us your specification. We will respond with availability, pricing, and documentation within 24 hours.",
      illustrationPath: "pages/home-contact-cta-illustration.png",
      buttonLabel: "Contact Us",
      buttonHref: "/contact",
    },
    {
      key: "about_contact_cta",
      variant: "light",
      heading: "CONTACT US",
      subheading: "Let's Talk About What You Need.",
      body: "Whether you are qualifying a new supplier, looking for a better price on an existing material, or exploring a new product category we are ready to have a technical and commercial conversation. Send us your specification. We will respond with availability, pricing, and documentation within 24 hours.",
      illustrationPath: "pages/about-cta-phone.png",
      buttonLabel: "Contact Us",
      buttonHref: "/contact",
    },
  ]);

  await db.insert(pageSections).values([
    {
      page: "home",
      sectionKey: "about_summary",
      eyebrow: "ABOUT US",
      heading: "Who We Are",
      body: "Entaj is a Jordanian-based specialty raw materials company, established in 2012 as a division of HS Group Ltd.\n\nA diversified manufacturing and investment group with operational facilities in Jordan and Turkey.\n\nOver more than a decade, we have built a reputation as a trusted, technically capable raw materials partner for manufacturers across the Middle East, Africa, and Asia. Our strength lies not only in sourcing, but in understanding how each material performs within your process. and ensuring it arrives on time, on specification, and at a competitive price. We operate at the intersection of science and supply chain.",
      imagePath: "pages/home-about-hq-building.png",
      extra: { decorativeBlobPath: "/assets/illustrations/home-about-blob-shape.png" },
      sortOrder: 0,
    },
    {
      page: "home",
      sectionKey: "why_entaj_intro",
      heading: "WHY ENTAJ",
      subheading: "6 Reasons Manufacturers Choose Us",
      imagePath: "pages/home-why-entaj-typewriter.png",
      sortOrder: 1,
    },
    {
      page: "home",
      sectionKey: "what_sets_apart",
      heading: "What Sets Us Apart",
      imagePath: "pages/home-what-sets-apart.png",
      sortOrder: 2,
    },
    {
      page: "divisions",
      sectionKey: "products_intro",
      heading: "OUR PRODUCTS",
      sortOrder: 0,
    },
    {
      page: "about",
      sectionKey: "intro",
      eyebrow: "ABOUT ENTAJ · EST. 2012",
      heading: "We operate at the intersection of science and supply chain.",
      body: "A Jordanian-based specialty raw materials company, part of HS Group Ltd — a diversified manufacturing and investment group with facilities in Jordan and Turkey.",
      sortOrder: 0,
    },
    {
      page: "about",
      sectionKey: "story",
      body: "Over more than a decade, we have built a reputation as a trusted, technically capable raw materials partner for manufacturers across the Middle East, Africa, and Asia. Our strength lies not only in sourcing, but in understanding how each material performs within your process.",
      extra: {
        timelineLinePath: "/assets/illustrations/about-stats-timeline.svg",
        timelineDotPath: "/assets/illustrations/about-stats-timeline-dot.svg",
      },
      sortOrder: 1,
    },
    {
      page: "contact",
      sectionKey: "get_in_touch",
      heading: "GET IN TOUCH",
      subheading: "Tell us about your material needs",
      sortOrder: 0,
    },
  ]);

  console.log("Populating media library from storage/ contents...");
  const storageFiles = walkStorageFiles();
  if (storageFiles.length > 0) {
    await db.insert(mediaLibrary).values(
      storageFiles.map((f) => {
        const ext = path.extname(f.absolute);
        const size = statSync(f.absolute).size;
        return {
          diskPath: f.diskPath,
          originalFilename: path.basename(f.absolute),
          mimeType: mimeFromExt(ext),
          sizeBytes: size,
          category: f.category as (typeof mediaLibrary.$inferInsert)["category"],
          uploadedByAdminId: seedAdmin.id,
        };
      }),
    );
  }

  await db.insert(activityLogs).values({
    adminId: seedAdmin.id,
    action: "seed",
    entityType: "database",
    meta: { note: "Initial database seed from Figma export" },
  });

  console.log(
    "\nCMS modules scaffolded with NO seed rows (no corresponding Figma content — left empty for admin to populate, not faked):",
  );
  console.log(
    `  blog_categories, blog_posts, testimonials, faqs, partners, services, pages (tables exist, 0 rows)`,
  );
  void blogCategories;
  void blogPosts;
  void testimonials;
  void faqs;
  void partners;
  void services;
  void pages;
  void contactMessages;

  console.log("\n=== Seed complete ===");
  console.log(`Divisions: ${insertedDivisions.length}`);
  console.log(`Products: ${productRows.length}`);
  console.log(`Media library entries: ${storageFiles.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
