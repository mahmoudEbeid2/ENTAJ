"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavLinks, type NavLinkItem } from "@/components/layout/nav-links";
import { MobileNav } from "@/components/layout/mobile-nav";

export function SiteHeaderShell({
  items,
  logoSrc,
  siteName,
}: {
  items: NavLinkItem[];
  logoSrc: string | null;
  siteName: string;
}) {
  const pathname = usePathname();
  // Product Details / Document pages don't carry a full photographic marketing hero for the
  // transparent nav to sit on — they get a strong standalone header instead. Scoped to this
  // route prefix only, so Home/About/Contact/Divisions keep their existing hero-integrated nav.
  const isInternal = pathname.startsWith("/products");

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-30",
        isInternal
          ? "sticky border-b border-white/10 bg-gradient-entaj shadow-[0_4px_24px_rgba(20,30,80,0.22)]"
          : "absolute",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-[1280px] items-center justify-between px-6",
          isInternal ? "py-4 lg:px-10 lg:py-5" : "py-6 lg:justify-start lg:gap-[128px] lg:px-17 lg:pt-[122.06px]",
        )}
      >
        <Link
          href="/"
          className="shrink-0 transition-opacity duration-200 hover:opacity-80"
          aria-label={`${siteName} home`}
        >
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={siteName}
              width={192}
              height={63}
              className={cn("w-auto", isInternal ? "h-10 lg:h-12" : "h-12 lg:h-[63px]")}
              priority
            />
          ) : (
            <span className="font-expanded text-2xl text-white">{siteName}</span>
          )}
        </Link>

        <NavLinks
          items={items}
          className={cn(
            "hidden items-center text-white lg:flex",
            isInternal
              ? "gap-9 font-expanded text-base font-semibold tracking-wide"
              : "w-[670px] justify-between font-expanded text-[23px]",
          )}
        />

        <MobileNav items={items} logoSrc={logoSrc} siteName={siteName} strong={isInternal} />
      </div>
    </header>
  );
}
