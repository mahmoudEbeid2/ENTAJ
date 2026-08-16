import Image from "next/image";
import Link from "next/link";
import { getNavItems, getSiteSettings } from "@/lib/data/site";
import { storageUrl } from "@/lib/utils/asset-url";
import { NavLinks } from "@/components/layout/nav-links";
import { MobileNav } from "@/components/layout/mobile-nav";

export async function SiteHeader() {
  const [navItems, settings] = await Promise.all([getNavItems("header"), getSiteSettings()]);
  const logoSrc = storageUrl(settings?.logoPath);
  const siteName = settings?.siteName ?? "ENTAJ";

  const items = navItems.map((item) => ({ id: item.id, label: item.label, href: item.href }));

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-6 lg:justify-start lg:gap-[128px] lg:px-17 lg:pt-[122.06px]">
        <Link href="/" className="shrink-0 transition-opacity duration-200 hover:opacity-80" aria-label={`${siteName} home`}>
          {logoSrc ? (
            <Image src={logoSrc} alt={siteName} width={192} height={63} className="h-12 w-auto lg:h-[63px]" priority />
          ) : (
            <span className="font-expanded text-2xl text-white">{siteName}</span>
          )}
        </Link>

        <NavLinks
          items={items}
          className="hidden w-[670px] items-center justify-between font-expanded text-[23px] text-white lg:flex"
        />

        <MobileNav items={items} logoSrc={logoSrc} siteName={siteName} />
      </div>
    </header>
  );
}
