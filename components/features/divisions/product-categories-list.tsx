import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductSpecRow } from "@/components/ui/product-spec-table";

function CategoryRow({ row }: { row: ProductSpecRow }) {
  const content = (
    <>
      <span className="font-expanded text-base font-bold text-white sm:text-lg">{row.name}</span>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 transition-transform duration-200 group-hover:translate-x-1">
        <ArrowRight className="size-4 text-white" aria-hidden="true" />
      </span>
    </>
  );

  const className =
    "bg-gradient-entaj group flex min-h-14 items-center justify-between gap-4 rounded-2xl px-5 py-3 transition-shadow duration-200 hover:shadow-[0_12px_24px_-8px_rgba(44,56,142,0.45)] sm:px-6";

  if (row.productId) {
    return (
      <Link href={`/products/${row.productId}`} className={className}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}

export function ProductCategoriesList({ rows }: { rows: ProductSpecRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {rows.map((row) => (
        <CategoryRow key={row.id} row={row} />
      ))}
    </div>
  );
}
