"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { productDocuments, activityLogs, PRODUCT_DOCUMENT_TYPES, type ProductDocumentType } from "@/database/schema";
import { saveUpload, deleteUpload, UploadValidationError } from "@/lib/storage/upload-service";
import { getSession } from "@/lib/auth/session";

const DOCUMENT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export interface ProductDocumentActionResult {
  success: boolean;
  error?: string;
}

function isDocumentType(value: unknown): value is ProductDocumentType {
  return typeof value === "string" && (PRODUCT_DOCUMENT_TYPES as readonly string[]).includes(value);
}

export async function saveProductDocument(formData: FormData): Promise<ProductDocumentActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  const productId = Number(formData.get("productId"));
  const type = formData.get("type");
  const file = formData.get("file");

  if (!Number.isInteger(productId) || productId <= 0) {
    return { success: false, error: "Invalid product." };
  }
  if (!isDocumentType(type)) {
    return { success: false, error: "Invalid document type." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please choose a PDF file to upload." };
  }

  try {
    const existing = (
      await db
        .select()
        .from(productDocuments)
        .where(and(eq(productDocuments.productId, productId), eq(productDocuments.type, type)))
        .limit(1)
    )[0];

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveUpload(buffer, {
      category: "products",
      allowedMimeTypes: ["application/pdf"],
      maxSizeBytes: DOCUMENT_MAX_UPLOAD_BYTES,
      replacesPath: existing?.filePath,
    });

    const values = {
      productId,
      type,
      filePath: saved.relativePath,
      fileName: file.name || `${type}.pdf`,
      fileSizeBytes: saved.sizeBytes,
    };

    if (existing) {
      await db.update(productDocuments).set(values).where(eq(productDocuments.id, existing.id));
    } else {
      await db.insert(productDocuments).values(values);
    }

    await logActivity(session.adminId, existing ? "updated" : "created", "product_document", productId);

    revalidatePath("/admin/products");
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Something went wrong while uploading the document." };
  }
}

export async function deleteProductDocument(id: number): Promise<ProductDocumentActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  try {
    const existing = (
      await db.select().from(productDocuments).where(eq(productDocuments.id, id)).limit(1)
    )[0];
    if (!existing) {
      return { success: false, error: "Document not found." };
    }

    await db.delete(productDocuments).where(eq(productDocuments.id, id));
    await deleteUpload(existing.filePath).catch(() => undefined);
    await logActivity(session.adminId, "deleted", "product_document", existing.productId);

    revalidatePath("/admin/products");
    revalidatePath(`/products/${existing.productId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete this document." };
  }
}

async function logActivity(adminId: number, action: string, entityType: string, entityId?: number) {
  await db.insert(activityLogs).values({ adminId, action, entityType, entityId: entityId ?? null });
}
