"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings, socialLinks, navItems, activityLogs } from "@/database/schema";
import { saveUpload } from "@/lib/storage/upload-service";
import { getSession } from "@/lib/auth/session";
import {
  siteSettingsFormSchema,
  socialLinkFormSchema,
  navItemFormSchema,
} from "@/features/admin/settings/schema";

export interface SettingsActionResult {
  success: boolean;
  error?: string;
}

export async function saveSiteSettings(formData: FormData): Promise<SettingsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const parsed = siteSettingsFormSchema.safeParse({
    siteName: formData.get("siteName"),
    tagline: formData.get("tagline"),
    footerTagline: formData.get("footerTagline"),
    establishedYear: formData.get("establishedYear"),
    parentCompany: formData.get("parentCompany"),
    contactEmail: formData.get("contactEmail"),
    contactWebsite: formData.get("contactWebsite"),
    contactPhone: formData.get("contactPhone"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  try {
    const [existing] = await db.select().from(siteSettings).limit(1);
    const uploads: Array<[keyof typeof siteSettings.$inferInsert, string]> = [
      ["logoPath", "logo"],
      ["faviconPath", "favicon"],
      ["logoLockupPath", "logoLockup"],
      ["footerLogoPath", "footerLogo"],
    ];
    const imagePaths: Record<string, string> = {};
    for (const [column, fieldName] of uploads) {
      const file = formData.get(fieldName);
      if (file instanceof File && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const existingPath = existing?.[column as keyof typeof existing] as string | null | undefined;
        const saved = await saveUpload(buffer, { category: "settings", replacesPath: existingPath });
        imagePaths[column] = saved.relativePath;
      }
    }

    const values = {
      siteName: parsed.data.siteName,
      tagline: parsed.data.tagline || null,
      footerTagline: parsed.data.footerTagline || null,
      establishedYear: parsed.data.establishedYear || null,
      parentCompany: parsed.data.parentCompany || null,
      contactEmail: parsed.data.contactEmail || null,
      contactWebsite: parsed.data.contactWebsite || null,
      contactPhone: parsed.data.contactPhone || null,
      ...imagePaths,
    };

    if (existing) {
      await db.update(siteSettings).set(values).where(eq(siteSettings.id, existing.id));
    } else {
      await db.insert(siteSettings).values(values);
    }

    await db
      .insert(activityLogs)
      .values({ adminId: session.adminId, action: "updated", entityType: "site_settings" });

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving settings." };
  }
}

export async function saveSocialLink(formData: FormData): Promise<SettingsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const parsed = socialLinkFormSchema.safeParse({
    platform: formData.get("platform"),
    url: formData.get("url"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  try {
    const [existing] = await db
      .select({ id: socialLinks.id })
      .from(socialLinks)
      .where(eq(socialLinks.platform, parsed.data.platform))
      .limit(1);

    if (existing) {
      await db
        .update(socialLinks)
        .set({ url: parsed.data.url, isActive: parsed.data.isActive })
        .where(eq(socialLinks.id, existing.id));
    } else {
      await db.insert(socialLinks).values(parsed.data);
    }

    await db.insert(activityLogs).values({
      adminId: session.adminId,
      action: "updated",
      entityType: "social_link",
    });

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the social link." };
  }
}

export async function saveNavItem(formData: FormData): Promise<SettingsActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Your session has expired. Please sign in again." };

  const parsed = navItemFormSchema.safeParse({
    id: Number(formData.get("id")),
    label: formData.get("label"),
    href: formData.get("href"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { id, ...values } = parsed.data;

  try {
    await db.update(navItems).set(values).where(eq(navItems.id, id));
    await db
      .insert(activityLogs)
      .values({ adminId: session.adminId, action: "updated", entityType: "nav_item", entityId: id });

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the nav item." };
  }
}
