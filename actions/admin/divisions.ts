"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import { homeDivisions, activityLogs } from "@/database/schema";
import { saveUpload } from "@/lib/storage/upload-service";
import { getSession } from "@/lib/auth/session";
import { divisionFormSchema } from "@/features/admin/divisions/schema";

export interface DivisionActionResult {
  success: boolean;
  error?: string;
}

export async function saveDivision(formData: FormData): Promise<DivisionActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const idRaw = formData.get("id");
  const parsed = divisionFormSchema.safeParse({
    id: idRaw ? Number(idRaw) : undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortName: formData.get("shortName"),
    subtitle: formData.get("subtitle"),
    numeral: formData.get("numeral"),
    description: formData.get("description"),
    ctaLabel: formData.get("ctaLabel"),
    isActive: formData.get("isActive") === "true",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { id, ...values } = parsed.data;

  const slugTaken = await db
    .select({ id: homeDivisions.id })
    .from(homeDivisions)
    .where(id ? and(eq(homeDivisions.slug, values.slug), ne(homeDivisions.id, id)) : eq(homeDivisions.slug, values.slug))
    .limit(1);
  if (slugTaken.length > 0) {
    return { success: false, error: "That slug is already in use by another home division." };
  }

  const imageFile = formData.get("image");

  try {
    let imagePath: string | undefined;
    if (imageFile instanceof File && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const existing = id
        ? (
            await db
              .select({ imagePath: homeDivisions.imagePath })
              .from(homeDivisions)
              .where(eq(homeDivisions.id, id))
              .limit(1)
          )[0]
        : undefined;
      const saved = await saveUpload(buffer, {
        category: "categories",
        replacesPath: existing?.imagePath,
      });
      imagePath = saved.relativePath;
    }

    const values2 = {
      ...values,
      subtitle: values.subtitle || null,
      numeral: values.numeral || null,
      description: values.description || null,
      href: `/divisions#${values.slug}`,
      ctaLabel: values.ctaLabel || "GO TO PRODUCTS",
    };

    if (id) {
      await db
        .update(homeDivisions)
        .set({ ...values2, ...(imagePath ? { imagePath } : {}) })
        .where(eq(homeDivisions.id, id));
      await logActivity(session.adminId, "updated", "home_division", id);
    } else {
      const [inserted] = await db
        .insert(homeDivisions)
        .values({ ...values2, imagePath: imagePath ?? null })
        .$returningId();
      await logActivity(session.adminId, "created", "home_division", (inserted as { id?: number })?.id);
    }


    revalidatePath("/admin/divisions");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the home division." };
  }
}

export async function deleteDivision(id: number): Promise<DivisionActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  try {
    await db
      .update(homeDivisions)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(homeDivisions.id, id));
    await logActivity(session.adminId, "deleted", "home_division", id);
    revalidatePath("/admin/divisions");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete this home division." };
  }
}

async function logActivity(adminId: number, action: string, entityType: string, entityId?: number) {
  await db.insert(activityLogs).values({ adminId, action, entityType, entityId: entityId ?? null });
}

