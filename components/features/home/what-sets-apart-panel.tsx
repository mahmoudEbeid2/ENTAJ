import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";

export interface WhatSetsApartItem {
  id: number;
  title: string;
  description: string;
  iconSrc?: string | null;
}

export function WhatSetsApartPanel({
  photoSrc,
  logoSrc,
  items,
}: {
  photoSrc: string;
  logoSrc?: string | null;
  items: WhatSetsApartItem[];
}) {
  return (
    <div className="overflow-hidden rounded-[32px] bg-gradient-entaj sm:rounded-[45px]">
      <div className="grid lg:grid-cols-[546px_1fr]">
        <div className="relative aspect-[546/902] lg:aspect-auto lg:min-h-[902px]">
          <Image src={photoSrc} alt="" fill sizes="(min-width: 1024px) 546px, 100vw" className="object-cover" />
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt="ENTAJ"
              width={192}
              height={63}
              className="absolute left-1/2 top-1/2 h-auto w-[170px] -translate-x-1/2 -translate-y-1/2 lg:w-[190px]"
            />
          ) : null}
        </div>
        <div className="flex flex-col justify-center gap-9 px-8 py-14 text-center text-white lg:gap-8 lg:px-20 lg:py-10">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={index * 90} className="flex flex-col items-center gap-3">
              {item.iconSrc ? (
                <Image src={item.iconSrc} alt="" width={68} height={67} className="h-[67px] w-[68px]" aria-hidden="true" />
              ) : null}
              <h3 className="font-expanded text-base font-bold">{item.title}</h3>
              <p className="max-w-[414px] text-sm leading-relaxed text-white">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
