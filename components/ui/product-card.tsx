import Image from "next/image";

export function ProductCard({
  name,
  imageSrc,
  featured,
}: {
  name: string;
  imageSrc?: string | null;
  featured?: boolean;
}) {
  return (
    <div className="group flex flex-col items-center gap-3 text-center">
      <div className="relative aspect-square w-full max-w-[270px] overflow-visible rounded-[28px] bg-[linear-gradient(90deg,#2c388e_0%,#73abd2_100%)] transition-transform duration-300 ease-out group-hover:-translate-y-1">
        <div className="absolute inset-0 overflow-hidden rounded-[28px]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              sizes="270px"
              className="object-contain px-[24%] py-[10%] transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : null}
        </div>
        {featured ? (
          <Image
            src="/assets/icons/icon-star-badge.svg"
            alt=""
            width={30}
            height={29}
            className="absolute -right-2 -top-3 z-20 size-[28px]"
            aria-hidden="true"
          />
        ) : null}
      </div>
      <span className="text-gradient-entaj mx-auto max-w-[190px] font-sans text-xl font-semibold uppercase">
        {name}
      </span>
    </div>
  );
}
