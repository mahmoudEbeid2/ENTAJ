import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface DivisionCardValueProp {
  id: number;
  title: string;
  description: string;
}

export function DivisionCard({
  numeral,
  name,
  subtitle,
  imageSrc,
  href,
  ctaLabel,
  valueProps,
}: {
  numeral?: string | null;
  name: string;
  subtitle?: string | null;
  imageSrc?: string | null;
  href: string;
  ctaLabel?: string | null;
  valueProps?: DivisionCardValueProp[];
}) {
  return (
    <article className="group overflow-hidden rounded-[32px] bg-gradient-entaj text-white sm:rounded-[45px]">
      {imageSrc ? (
        <div className="relative aspect-[1118/629] w-full overflow-hidden lg:aspect-auto lg:h-[629px]">
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(min-width: 1024px) 1119px, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            unoptimized
          />

          <div className="absolute inset-0 flex flex-col justify-start p-6 lg:p-[53px]">
            {numeral ? (
              <p className="font-expanded text-4xl font-thin leading-none sm:text-6xl lg:text-[96px]">{numeral}</p>
            ) : null}
            <div className="mt-2 max-w-[320px] sm:max-w-[400px] lg:mt-4 lg:max-w-[455px]">
              <h3 className="font-expanded text-lg font-bold leading-snug sm:text-xl lg:text-2xl">{name}</h3>
              {subtitle ? (
                <p className="font-expanded text-lg leading-snug sm:text-xl lg:text-2xl">{subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="px-6 py-6 lg:px-[53px] lg:py-10">
        {valueProps && valueProps.length > 0 ? (
          <div className="space-y-4 font-expanded text-sm leading-relaxed sm:text-base">
            {valueProps.map((prop) => (
              <p key={prop.id}>
                {prop.title} {prop.description}
              </p>
            ))}
          </div>
        ) : null}

        <Button
          render={<Link href={href} />}
          className="mt-8 h-[53px] w-full rounded-full bg-entaj-blue text-base font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-entaj-blue/90 hover:shadow-lg sm:text-lg lg:text-xl"
        >
          {ctaLabel ?? "GO TO PRODUCTS"}
        </Button>
      </div>
    </article>
  );
}
