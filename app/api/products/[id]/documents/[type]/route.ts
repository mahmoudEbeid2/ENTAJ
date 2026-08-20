import { stat, readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productDocuments, PRODUCT_DOCUMENT_TYPES } from "@/database/schema";
import { resolveStoragePath } from "@/lib/storage/upload-service";

function isDocumentType(value: string): value is (typeof PRODUCT_DOCUMENT_TYPES)[number] {
  return (PRODUCT_DOCUMENT_TYPES as readonly string[]).includes(value);
}

function sanitizeFilename(name: string): string {
  return name.replace(/["\r\n]/g, "");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> },
) {
  const { id: idParam, type } = await params;
  const productId = Number(idParam);

  if (!Number.isInteger(productId) || productId <= 0 || !isDocumentType(type)) {
    return new NextResponse(null, { status: 404 });
  }

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.isActive, true)))
    .limit(1);
  if (!product) {
    return new NextResponse(null, { status: 404 });
  }

  const [document] = await db
    .select()
    .from(productDocuments)
    .where(and(eq(productDocuments.productId, productId), eq(productDocuments.type, type)))
    .limit(1);
  if (!document) {
    return new NextResponse(null, { status: 404 });
  }

  const absolutePath = resolveStoragePath(document.filePath);
  if (!absolutePath) {
    return new NextResponse(null, { status: 404 });
  }

  let fileStat;
  try {
    fileStat = await stat(absolutePath);
  } catch {
    return new NextResponse(null, { status: 404 });
  }
  if (!fileStat.isFile()) {
    return new NextResponse(null, { status: 404 });
  }

  const download = request.nextUrl.searchParams.get("download") === "1";
  const disposition = download ? "attachment" : "inline";
  const filename = sanitizeFilename(document.fileName);

  const buffer = await readFile(absolutePath);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(fileStat.size),
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
