"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products, activityLogs } from "@/database/schema";
import { saveUpload } from "@/lib/storage/upload-service";
import { getSession } from "@/lib/auth/session";
import { categoryFormSchema } from "@/features/admin/categories/schema";

export interface CategoryActionResult {
  success: boolean;
  error?: string;
}

export async function saveCategory(formData: FormData): Promise<CategoryActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const idRaw = formData.get("id");
  const parsed = categoryFormSchema.safeParse({
    id: idRaw ? Number(idRaw) : undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortName: formData.get("shortName"),
    description: formData.get("description"),
    bgColor: formData.get("bgColor"),
    isActive: formData.get("isActive") === "true",
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const { id, ...values } = parsed.data;

  const slugTaken = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        id ? and(eq(categories.slug, values.slug), ne(categories.id, id)) : eq(categories.slug, values.slug),
        isNull(categories.deletedAt),
      ),
    )
    .limit(1);
  if (slugTaken.length > 0) {
    return { success: false, error: "That slug is already in use by another category." };
  }

  const iconFile = formData.get("icon");

  try {
    let iconPath: string | undefined;
    if (iconFile instanceof File && iconFile.size > 0) {
      const buffer = Buffer.from(await iconFile.arrayBuffer());
      const existing = id
        ? (
            await db
              .select({ iconPath: categories.iconPath })
              .from(categories)
              .where(eq(categories.id, id))
              .limit(1)
          )[0]
        : undefined;
      const saved = await saveUpload(buffer, {
        category: "categories",
        replacesPath: existing?.iconPath,
      });
      iconPath = saved.relativePath;
    }


    const payload = {
      ...values,
      shortName: values.shortName || null,
      description: values.description || null,
      bgColor: values.bgColor || null,
    };

    if (id) {
      await db
        .update(categories)
        .set({ ...payload, ...(iconPath ? { iconPath } : {}) })
        .where(eq(categories.id, id));
      await logActivity(session.adminId, "updated", "category", id);
    } else {
      const [inserted] = await db
        .insert(categories)
        .values({ ...payload, iconPath: iconPath ?? null })
        .$returningId();
      await logActivity(session.adminId, "created", "category", (inserted as { id?: number })?.id);
    }


    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/divisions");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the category." };
  }
}

export async function deleteCategory(id: number): Promise<CategoryActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const activeProducts = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.divisionId, id), isNull(products.deletedAt)))
    .limit(1);
  if (activeProducts.length > 0) {
    return {
      success: false,
      error: "This category still has active products. Move or delete them first.",
    };
  }

  try {
    await db
      .update(categories)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(categories.id, id));
    await logActivity(session.adminId, "deleted", "category", id);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/divisions");
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete this category." };
  }
}

async function logActivity(adminId: number, action: string, entityType: string, entityId?: number) {
  await db.insert(activityLogs).values({ adminId, action, entityType, entityId: entityId ?? null });
}
