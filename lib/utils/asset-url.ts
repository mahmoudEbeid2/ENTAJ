/** Resolves a DB-stored storage-relative path (e.g. "products/x.webp") to its serving URL. */
export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `/api/storage/${path}`;
}
