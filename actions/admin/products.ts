"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, activityLogs } from "@/database/schema";
import { saveUpload } from "@/lib/storage/upload-service";
import { getSession } from "@/lib/auth/session";
import { productFormSchema } from "@/features/admin/products/schema";

export interface ProductActionResult {
  success: boolean;
  error?: string;
}

export async function saveProduct(formData: FormData): Promise<ProductActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const idRaw = formData.get("id");
  const parsed = productFormSchema.safeParse({
    id: idRaw ? Number(idRaw) : undefined,
    divisionId: Number(formData.get("divisionId")),
    name: formData.get("name"),
    recommendedLabel: formData.get("recommendedLabel"),
    spec: formData.get("spec"),
    description: formData.get("description"),
    isRecommended: formData.get("isRecommended") === "true",
    isFeatured: formData.get("isFeatured") === "true",
    isActive: formData.get("isActive") === "true",
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
      const existing = id
        ? (
            await db
              .select({ imagePath: products.imagePath })
              .from(products)
              .where(eq(products.id, id))
              .limit(1)
          )[0]
        : undefined;
      const saved = await saveUpload(buffer, {
        category: "products",
        replacesPath: existing?.imagePath,
      });
      imagePath = saved.relativePath;
    }

    const values2 = {
      ...values,
      recommendedLabel: values.recommendedLabel || null,
      spec: values.spec || null,
      description: values.description || null,
    };

    if (id) {
      await db
        .update(products)
        .set({ ...values2, ...(imagePath ? { imagePath } : {}) })
        .where(eq(products.id, id));
      await logActivity(session.adminId, "updated", "product", id);
    } else {
      const [inserted] = await db
        .insert(products)
        .values({ ...values2, imagePath: imagePath ?? null })
        .$returningId();
      await logActivity(session.adminId, "created", "product", inserted?.id);
    }

    revalidatePath("/admin/products");
    revalidatePath("/divisions");
    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong while saving the product." };
  }
}

export async function deleteProduct(id: number): Promise<ProductActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  try {
    await db
      .update(products)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(products.id, id));
    await logActivity(session.adminId, "deleted", "product", id);
    revalidatePath("/admin/products");
    revalidatePath("/divisions");
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete this product." };
  }
}

async function logActivity(adminId: number, action: string, entityType: string, entityId?: number) {
  await db.insert(activityLogs).values({ adminId, action, entityType, entityId: entityId ?? null });
}
