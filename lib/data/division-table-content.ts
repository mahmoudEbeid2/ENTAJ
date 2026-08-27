/**
 * The DIVISIONS-page rendering condition: a division's spec table shows if and only if it
 * has its own table content (division_spec_rows). This must never be based on Product
 * Catalog state (count, isActive, isRecommended, isFeatured, etc.) — a division can have
 * zero Product Catalog products and a populated spec table, and it must still render.
 *
 * Kept dependency-free (no DB import) so this decision is unit-testable without a live
 * database — see content.test.ts.
 */
export function filterDivisionsWithTableContent<T extends { specRows: unknown[] }>(
  divisionsWithSpecRows: T[],
): T[] {
  return divisionsWithSpecRows.filter((division) => division.specRows.length > 0);
}
