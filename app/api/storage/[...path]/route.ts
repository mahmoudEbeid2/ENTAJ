import { stat, readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { resolveStoragePath } from "@/lib/storage/upload-service";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  if (!segments || segments.length === 0 || segments.some((s) => s === "..")) {
    return new NextResponse(null, { status: 404 });
  }

  const relativePath = segments.join("/");
  const absolutePath = resolveStoragePath(relativePath);
  if (!absolutePath) {
    return new NextResponse(null, { status: 404 });
  }

  const extension = relativePath.slice(relativePath.lastIndexOf(".")).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
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

  const etag = `"${fileStat.size}-${fileStat.mtimeMs}"`;
  const ifNoneMatch = _request.headers.get("if-none-match");
  if (ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304 });
  }

  const buffer = await readFile(absolutePath);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileStat.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
      "Last-Modified": fileStat.mtime.toUTCString(),
    },
  });
}
