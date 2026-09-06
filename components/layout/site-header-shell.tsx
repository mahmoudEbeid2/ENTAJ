"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavLinks, type NavLinkItem } from "@/components/layout/nav-links";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useCategoryThemeColor } from "@/components/layout/category-theme-context";

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
  // Product Details / Document pages, and per-division product listing pages, don't carry a
  // full photographic marketing hero for the transparent nav to sit on — they get a strong
  // standalone header instead, same as Product Details. Scoped to these route prefixes only,
  // so Home/About/Contact/the main Divisions page keep their existing hero-integrated nav.
  // "/divisions/" (with trailing slash) deliberately excludes the bare "/divisions" page,
  // which does have a hero and should keep the transparent nav.
  const isInternal = pathname.startsWith("/products") || pathname.startsWith("/divisions/");
  // Category detail pages publish their category's color via CategoryThemeSync; falls back to
  // the default brand gradient when no category color is configured (or on non-category pages).
  const categoryColor = useCategoryThemeColor();
  const isCategoryPage = pathname.startsWith("/divisions/");
  const dynamicColor = isCategoryPage ? categoryColor : null;

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-30",
        isInternal
          ? cn(
              "sticky border-b border-white/10 shadow-[0_4px_24px_rgba(20,30,80,0.22)]",
              !dynamicColor && "bg-gradient-entaj",
            )
          : "absolute",
      )}
      style={dynamicColor ? { backgroundColor: dynamicColor } : undefined}
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

        <MobileNav
          items={items}
          logoSrc={logoSrc}
          siteName={siteName}
          strong={isInternal}
          color={dynamicColor}
        />
      </div>
    </header>
  );
}
