import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { storageUrl } from "@/lib/utils/asset-url";
import type { ProductSpecRow } from "@/components/ui/product-spec-table";

function CategoryRow({ row }: { row: ProductSpecRow }) {
  const iconSrc = storageUrl(row.iconPath);

  const pill = (
    <span className="bg-gradient-entaj group flex h-[57px] flex-1 items-center justify-between gap-4 rounded-2xl px-5 transition-shadow duration-200 group-hover:shadow-[0_12px_24px_-8px_rgba(44,56,142,0.45)] sm:px-6">
      <span className="font-expanded text-base font-medium text-white sm:text-lg">
        {row.description ?? row.name}
      </span>
      <ArrowRight
        className="size-6 shrink-0 text-white transition-transform duration-200 group-hover:translate-x-1"
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </span>
  );

  const content = (
    <>
      <span className="flex w-full shrink-0 items-center gap-3 sm:w-[335px]">
        {iconSrc ? (
          <Image src={iconSrc} alt="" width={38} height={38} className="size-8 shrink-0 sm:size-9" aria-hidden="true" />
        ) : null}
        <span className="font-expanded text-base font-bold text-entaj-dark-grey sm:text-lg">{row.name}</span>
      </span>
      {pill}
    </>
  );

  const className = "group flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-6";

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
    <div className="flex flex-col gap-3 sm:gap-[7px]">
      {rows.map((row) => (
        <CategoryRow key={row.id} row={row} />
      ))}
    </div>
  );
}
