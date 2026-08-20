import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ProductCard({
  id,
  name,
  imageSrc,
  featured,
}: {
  id: number;
  name: string;
  imageSrc?: string | null;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/products/${id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-entaj-blue/10 bg-white shadow-[0_1px_3px_rgba(44,56,142,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-entaj-blue/25 hover:shadow-[0_20px_40px_-12px_rgba(44,56,142,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[linear-gradient(135deg,#eef1fa_0%,#e4ecf5_100%)]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(min-width: 1024px) 270px, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-7 transition-transform duration-300 ease-out group-hover:scale-[1.06] sm:p-8"
          />
        ) : null}
        {featured ? (
          <span className="absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(44,56,142,0.18)]">
            <Image
              src="/assets/icons/icon-star-badge.svg"
              alt="Featured product"
              width={30}
              height={29}
              className="size-[18px]"
            />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        <h3 className="line-clamp-2 font-sans text-base font-semibold uppercase leading-snug tracking-tight text-entaj-text sm:text-lg">
          {name}
        </h3>

        <div className="mt-auto flex items-center gap-1.5 border-t border-entaj-blue/10 pt-3.5 font-expanded text-xs font-semibold uppercase tracking-wide text-entaj-blue transition-colors duration-200 group-hover:text-entaj-blue/75">
          View Details
          <ArrowRight className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
