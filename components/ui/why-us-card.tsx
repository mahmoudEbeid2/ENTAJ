import Image from "next/image";

export function WhyUsCard({
  number,
  title,
  description,
  imageSrc,
}: {
  number: number;
  title: string;
  description: string;
  imageSrc?: string | null;
}) {
  return (
    <div className="flex h-full min-w-0 gap-4 sm:gap-5">
      {imageSrc ? (
        <div className="relative h-full w-[35%] shrink-0 overflow-hidden rounded-[20px] sm:rounded-[30px]">
          <Image
            src={imageSrc}
            alt=""
            fill
            aria-hidden="true"
            sizes="(min-width: 1024px) 164px, 30vw"
            className="object-cover"
            style={{ maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)" }}
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1 rounded-[20px] bg-entaj-light-grey p-5 sm:rounded-[30px] sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="font-expanded text-6xl font-thin leading-none text-[#878787] sm:text-7xl lg:text-8xl">
            {number}
          </span>
          <h3 className="min-w-0 font-expanded text-sm font-bold leading-snug text-entaj-blue sm:text-base">{title}</h3>
        </div>
        <hr className="my-4 h-px border-0 bg-gradient-entaj" />
        <p className="text-[11px] leading-relaxed tracking-[0.1px] text-entaj-medium-grey sm:text-xs">{description}</p>
      </div>
    </div>
  );
}
