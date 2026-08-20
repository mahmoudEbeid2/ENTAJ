import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { STORAGE_CATEGORIES } from "@/database/schema/media";

export type StorageCategory = (typeof STORAGE_CATEGORIES)[number];

const STORAGE_ROOT = path.resolve(process.cwd(), process.env.STORAGE_ROOT || "storage");
const MAX_UPLOAD_BYTES = Number(process.env.STORAGE_MAX_UPLOAD_MB || 5) * 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

export class UploadValidationError extends Error {}

function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  if (
    buffer.length >= 6 &&
    (buffer.subarray(0, 6).toString("ascii") === "GIF87a" ||
      buffer.subarray(0, 6).toString("ascii") === "GIF89a")
  ) {
    return "image/gif";
  }
  const head = buffer.subarray(0, 512).toString("utf8").trimStart();
  if (head.startsWith("<?xml") || head.startsWith("<svg")) {
    return "image/svg+xml";
  }
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return "application/pdf";
  }
  return null;
}

function assertSafeSvg(buffer: Buffer) {
  const content = buffer.toString("utf8");
  if (/<script/i.test(content) || /\bon[a-z]+\s*=/i.test(content)) {
    throw new UploadValidationError("SVG file contains disallowed script/event-handler content");
  }
}

export interface SaveUploadOptions {
  category: StorageCategory;
  replacesPath?: string | null;
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
}

export interface SavedUpload {
  relativePath: string;
  mimeType: string;
  sizeBytes: number;
}

export async function saveUpload(buffer: Buffer, options: SaveUploadOptions): Promise<SavedUpload> {
  const maxSize = options.maxSizeBytes ?? MAX_UPLOAD_BYTES;
  if (buffer.length === 0) {
    throw new UploadValidationError("Uploaded file is empty");
  }
  if (buffer.length > maxSize) {
    throw new UploadValidationError(
      `File exceeds the maximum allowed size of ${Math.floor(maxSize / (1024 * 1024))}MB`,
    );
  }

  const mimeType = detectMimeType(buffer);
  if (!mimeType) {
    throw new UploadValidationError("Unrecognized or unsupported file type");
  }

  const allowed = options.allowedMimeTypes ?? Object.keys(MIME_EXTENSIONS);
  if (!allowed.includes(mimeType)) {
    throw new UploadValidationError(`File type ${mimeType} is not allowed for this upload`);
  }

  if (mimeType === "image/svg+xml") {
    assertSafeSvg(buffer);
  }

  const extension = MIME_EXTENSIONS[mimeType];
  const filename = `${randomUUID()}${extension}`;
  const relativePath = `${options.category}/${filename}`;
  const absoluteDir = path.join(STORAGE_ROOT, options.category);
  const absolutePath = path.join(absoluteDir, filename);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absolutePath, buffer);

  if (options.replacesPath) {
    await deleteUpload(options.replacesPath).catch(() => undefined);
  }

  return { relativePath, mimeType, sizeBytes: buffer.length };
}

export async function deleteUpload(relativePath: string): Promise<void> {
  const resolved = resolveStoragePath(relativePath);
  if (!resolved) return;
  await unlink(resolved).catch((err: NodeJS.ErrnoException) => {
    if (err.code !== "ENOENT") throw err;
  });
}

/**
 * Resolves a DB-stored relative path (e.g. "products/x.webp") to an absolute
 * filesystem path, rejecting anything that would escape STORAGE_ROOT.
 */
export function resolveStoragePath(relativePath: string): string | null {
  const normalized = path.normalize(relativePath).replace(/^([/\\])+/, "");
  const resolved = path.resolve(STORAGE_ROOT, normalized);
  if (resolved !== STORAGE_ROOT && !resolved.startsWith(STORAGE_ROOT + path.sep)) {
    return null;
  }
  return resolved;
}

export function isValidStorageCategory(value: string): value is StorageCategory {
  return (STORAGE_CATEGORIES as readonly string[]).includes(value);
}
