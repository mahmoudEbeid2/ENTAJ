/**
 * Resolves a DB-stored storage-relative path (e.g. "products/x.webp") to its serving URL.
 * Some rows (mostly seed data — see database/seed.ts) instead store an already-absolute
 * static asset path (e.g. "/assets/icons/stat-icon-experience.svg") or a full URL; those are
 * returned unchanged rather than getting "/api/storage/" doubled onto the front of them.
 */
export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/") || /^https?:\/\//.test(path)) return path;
  return `/api/storage/${path}`;
}
