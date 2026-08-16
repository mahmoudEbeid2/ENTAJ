"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  heroSlides,
  pageSections,
  seoMeta,
  stats,
  valueProps,
  whyUsFeatures,
  marketRegions,
  ctaPanels,
  offices,
  activityLogs,
} from "@/database/schema";
import { saveUpload } from "@/lib/storage/upload-service";
import { getSession } from "@/lib/auth/session";
import {
  heroSlideFormSchema,
  pageSectionFormSchema,
  seoMetaFormSchema,
  statFormSchema,
  valuePropFormSchema,
  whyUsFeatureFormSchema,
  marketRegionFormSchema,
  ctaPanelFormSchema,
  officeFormSchema,
} from "@/features/admin/content/schema";

export interface ContentActionResult {
  success: boolean;
  error?: string;
}

export async function saveHeroSlide(formData: FormData): Promise<ContentActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const idRaw = formData.get("id");
  const parsed = heroSlideFormSchema.safeParse({
    id: idRaw ? Number(idRaw) : undefined,
    page: formData.get("page"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    ctaPrimaryLabel: formData.get("ctaPrimaryLabel"),
    ctaPrimaryHref: formData.get("ctaPrimaryHref"),
    ctaSecondaryLabel: formData.get("ctaSecondaryLabel"),
    ctaSecondaryHref: formData.get("ctaSecondaryHref"),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { id, ...values } = parsed.data;
  const imageFile = formData.get("image");

  try {
    let imagePath: string | undefined;
    if (imageFile instanceof File && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const existing = id
        ? (
            await db.select({ imagePath: heroSlides.imagePath }).from(heroSlides).where(eq(heroSlides.id, id)).limit(1)
          )[0]
        : undefined;
      const saved = await saveUpload(buffer, { category: "pages", replacesPath: existing?.imagePath });
      imagePath = saved.relativePath;
    } else if (!id) {
      return { success: false, error: "An image is required for a new hero slide." };
    }

    const values2 = {
      ...values,
      subtitle: values.subtitle || null,
      ctaPrimaryLabel: values.ctaPrimaryLabel || null,
      ctaPrimaryHref: values.ctaPrimaryHref || null,
      ctaSecondaryLabel: values.ctaSecondaryLabel || null,
      ctaSecondaryHref: values.ctaSecondaryHref || null,
    };

    if (id) {
      await db
        .update(heroSlides)
        .set({ ...values2, ...(imagePath ? { imagePath } : {}) })
        .where(eq(heroSlides.id, id));
      await logActivity(session.adminId, "updated", "hero_slide", id);
    } else {
      const [inserted] = await db
        .insert(heroSlides)
        .values({ ...values2, imagePath: imagePath! })
        .$returningId();
      await logActivity(session.adminId, "created", "hero_slide", inserted?.id);
    }

    revalidatePath("/admin/content");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the hero slide." };
  }
}

export async function deleteHeroSlide(id: number): Promise<ContentActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  try {
    await db.delete(heroSlides).where(eq(heroSlides.id, id));
    await logActivity(session.adminId, "deleted", "hero_slide", id);
    revalidatePath("/admin/content");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete this hero slide." };
  }
}

export async function savePageSection(formData: FormData): Promise<ContentActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const parsed = pageSectionFormSchema.safeParse({
    id: Number(formData.get("id")),
    eyebrow: formData.get("eyebrow"),
    heading: formData.get("heading"),
    subheading: formData.get("subheading"),
    body: formData.get("body"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { id, ...values } = parsed.data;
  const imageFile = formData.get("image");

  try {
    let imagePath: string | undefined;
    if (imageFile instanceof File && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const existing = (
        await db.select({ imagePath: pageSections.imagePath }).from(pageSections).where(eq(pageSections.id, id)).limit(1)
      )[0];
      const saved = await saveUpload(buffer, { category: "pages", replacesPath: existing?.imagePath });
      imagePath = saved.relativePath;
    }

    await db
      .update(pageSections)
      .set({
        ...values,
        eyebrow: values.eyebrow || null,
        heading: values.heading || null,
        subheading: values.subheading || null,
        body: values.body || null,
        ...(imagePath ? { imagePath } : {}),
      })
      .where(eq(pageSections.id, id));
    await logActivity(session.adminId, "updated", "page_section", id);

    revalidatePath("/admin/content");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the section." };
  }
}

export async function saveSeoMeta(formData: FormData): Promise<ContentActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const parsed = seoMetaFormSchema.safeParse({
    id: Number(formData.get("id")),
    title: formData.get("title"),
    description: formData.get("description"),
    keywords: formData.get("keywords"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { id, ...values } = parsed.data;
  const imageFile = formData.get("image");

  try {
    let ogImagePath: string | undefined;
    if (imageFile instanceof File && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const existing = (
        await db.select({ ogImagePath: seoMeta.ogImagePath }).from(seoMeta).where(eq(seoMeta.id, id)).limit(1)
      )[0];
      const saved = await saveUpload(buffer, { category: "pages", replacesPath: existing?.ogImagePath });
      ogImagePath = saved.relativePath;
    }
    await db
      .update(seoMeta)
      .set({ ...values, keywords: values.keywords || null, ...(ogImagePath ? { ogImagePath } : {}) })
      .where(eq(seoMeta.id, id));
    await logActivity(session.adminId, "updated", "seo_meta", id);
    revalidatePath("/admin/content");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving SEO metadata." };
  }
}

export async function saveStat(formData: FormData): Promise<ContentActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const parsed = statFormSchema.safeParse({
    id: Number(formData.get("id")),
    value: formData.get("value"),
    label: formData.get("label"),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { id, ...values } = parsed.data;

  try {
    await db.update(stats).set(values).where(eq(stats.id, id));
    await logActivity(session.adminId, "updated", "stat", id);
    revalidatePath("/admin/content");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the stat." };
  }
}

export async function saveValueProp(formData: FormData): Promise<ContentActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const parsed = valuePropFormSchema.safeParse({
    id: Number(formData.get("id")),
    title: formData.get("title"),
    description: formData.get("description"),
    aboutTitle: formData.get("aboutTitle"),
    aboutDescription: formData.get("aboutDescription"),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { id, ...values } = parsed.data;
  const homeIconFile = formData.get("homeIcon");
  const aboutIconFile = formData.get("aboutIcon");

  try {
    const existing = (
      await db
        .select({ homeIconPath: valueProps.homeIconPath, aboutIconPath: valueProps.aboutIconPath })
        .from(valueProps)
        .where(eq(valueProps.id, id))
        .limit(1)
    )[0];

    let homeIconPath: string | undefined;
    if (homeIconFile instanceof File && homeIconFile.size > 0) {
      const buffer = Buffer.from(await homeIconFile.arrayBuffer());
      const saved = await saveUpload(buffer, { category: "pages", replacesPath: existing?.homeIconPath });
      homeIconPath = saved.relativePath;
    }
    let aboutIconPath: string | undefined;
    if (aboutIconFile instanceof File && aboutIconFile.size > 0) {
      const buffer = Buffer.from(await aboutIconFile.arrayBuffer());
      const saved = await saveUpload(buffer, { category: "pages", replacesPath: existing?.aboutIconPath });
      aboutIconPath = saved.relativePath;
    }

    await db
      .update(valueProps)
      .set({
        ...values,
        aboutTitle: values.aboutTitle || null,
        aboutDescription: values.aboutDescription || null,
        ...(homeIconPath ? { homeIconPath } : {}),
        ...(aboutIconPath ? { aboutIconPath } : {}),
      })
      .where(eq(valueProps.id, id));
    await logActivity(session.adminId, "updated", "value_prop", id);
    revalidatePath("/admin/content");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the value prop." };
  }
}

export async function saveWhyUsFeature(formData: FormData): Promise<ContentActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const parsed = whyUsFeatureFormSchema.safeParse({
    id: Number(formData.get("id")),
    title: formData.get("title"),
    description: formData.get("description"),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { id, ...values } = parsed.data;
  const imageFile = formData.get("image");

  try {
    let imagePath: string | undefined;
    if (imageFile instanceof File && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const existing = (
        await db
          .select({ imagePath: whyUsFeatures.imagePath })
          .from(whyUsFeatures)
          .where(eq(whyUsFeatures.id, id))
          .limit(1)
      )[0];
      const saved = await saveUpload(buffer, { category: "pages", replacesPath: existing?.imagePath });
      imagePath = saved.relativePath;
    }
    await db
      .update(whyUsFeatures)
      .set({ ...values, ...(imagePath ? { imagePath } : {}) })
      .where(eq(whyUsFeatures.id, id));
    await logActivity(session.adminId, "updated", "why_us_feature", id);
    revalidatePath("/admin/content");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the feature." };
  }
}

export async function saveMarketRegion(formData: FormData): Promise<ContentActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const parsed = marketRegionFormSchema.safeParse({
    id: Number(formData.get("id")),
    name: formData.get("name"),
    countries: formData.get("countries"),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { id, ...values } = parsed.data;

  try {
    await db.update(marketRegions).set(values).where(eq(marketRegions.id, id));
    await logActivity(session.adminId, "updated", "market_region", id);
    revalidatePath("/admin/content");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the region." };
  }
}

export async function saveCtaPanel(formData: FormData): Promise<ContentActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const parsed = ctaPanelFormSchema.safeParse({
    id: Number(formData.get("id")),
    heading: formData.get("heading"),
    subheading: formData.get("subheading"),
    body: formData.get("body"),
    buttonLabel: formData.get("buttonLabel"),
    buttonHref: formData.get("buttonHref"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { id, ...values } = parsed.data;
  const iconFile = formData.get("icon");
  const illustrationFile = formData.get("illustration");

  try {
    const existing = (
      await db
        .select({ iconPath: ctaPanels.iconPath, illustrationPath: ctaPanels.illustrationPath })
        .from(ctaPanels)
        .where(eq(ctaPanels.id, id))
        .limit(1)
    )[0];

    let iconPath: string | undefined;
    if (iconFile instanceof File && iconFile.size > 0) {
      const buffer = Buffer.from(await iconFile.arrayBuffer());
      const saved = await saveUpload(buffer, { category: "pages", replacesPath: existing?.iconPath });
      iconPath = saved.relativePath;
    }
    let illustrationPath: string | undefined;
    if (illustrationFile instanceof File && illustrationFile.size > 0) {
      const buffer = Buffer.from(await illustrationFile.arrayBuffer());
      const saved = await saveUpload(buffer, { category: "pages", replacesPath: existing?.illustrationPath });
      illustrationPath = saved.relativePath;
    }

    await db
      .update(ctaPanels)
      .set({
        ...values,
        subheading: values.subheading || null,
        buttonLabel: values.buttonLabel || null,
        buttonHref: values.buttonHref || null,
        ...(iconPath ? { iconPath } : {}),
        ...(illustrationPath ? { illustrationPath } : {}),
      })
      .where(eq(ctaPanels.id, id));
    await logActivity(session.adminId, "updated", "cta_panel", id);
    revalidatePath("/admin/content");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the CTA panel." };
  }
}

export async function saveOffice(formData: FormData): Promise<ContentActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const parsed = officeFormSchema.safeParse({
    id: Number(formData.get("id")),
    label: formData.get("label"),
    address: formData.get("address"),
    isPrimary: formData.get("isPrimary") === "true",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { id, ...values } = parsed.data;
  const flagFile = formData.get("flag");

  try {
    let flagIconPath: string | undefined;
    if (flagFile instanceof File && flagFile.size > 0) {
      const buffer = Buffer.from(await flagFile.arrayBuffer());
      const existing = (
        await db.select({ flagIconPath: offices.flagIconPath }).from(offices).where(eq(offices.id, id)).limit(1)
      )[0];
      const saved = await saveUpload(buffer, { category: "pages", replacesPath: existing?.flagIconPath });
      flagIconPath = saved.relativePath;
    }
    await db
      .update(offices)
      .set({ ...values, ...(flagIconPath ? { flagIconPath } : {}) })
      .where(eq(offices.id, id));
    await logActivity(session.adminId, "updated", "office", id);
    revalidatePath("/admin/content");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the office." };
  }
}

async function logActivity(adminId: number, action: string, entityType: string, entityId?: number) {
  await db.insert(activityLogs).values({ adminId, action, entityType, entityId: entityId ?? null });
}
