import Image from "next/image";
import Link from "next/link";
import { getNavItems, getOffices, getSiteSettings, getSocialLinks } from "@/lib/data/site";
import { storageUrl } from "@/lib/utils/asset-url";
import { SocialLinks } from "@/components/ui/social-links";
import { Reveal } from "@/components/ui/reveal";

export async function SiteFooter() {
  const [navItems, settings, offices, social] = await Promise.all([
    getNavItems("footer"),
    getSiteSettings(),
    getOffices(),
    getSocialLinks(),
  ]);

  const logoSrc = storageUrl(settings?.footerLogoPath ?? settings?.logoLockupPath ?? settings?.logoPath);
  const siteName = settings?.siteName ?? "ENTAJ";
  const addressLine = offices.map((office) => office.address).join(" | ");

  return (
    <footer className="overflow-x-hidden bg-[linear-gradient(180deg,#3d549d_0%,#2c388e_15%)] text-white">
      <Reveal
        variant="fade"
        duration={900}
        className="mx-auto flex max-w-[1440px] flex-col items-center px-6 pt-12 pb-10 text-center sm:pt-16 sm:pb-14 lg:pt-[82px] lg:pb-[78px]"
      >
        <Link href="/" aria-label={`${siteName} home`}>
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={siteName}
              width={234}
              height={79}
              className="h-12 w-auto sm:h-14 lg:h-[74px]"
            />
          ) : (
            <span className="font-expanded text-2xl">{siteName}</span>
          )}
        </Link>

        <nav aria-label="Footer" className="mt-10 w-full sm:mt-12 lg:mt-[58px]">
          <ul className="mx-auto flex w-full max-w-[670px] flex-wrap items-center justify-center gap-x-6 gap-y-3 font-expanded text-base text-white sm:gap-x-8 sm:text-lg lg:justify-between lg:text-[23px]">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-4 h-px w-full max-w-[773px] bg-white/90 sm:mt-[19px]" />

        <div className="mt-4 flex w-full max-w-full flex-col items-center gap-x-5 gap-y-3 font-sans text-sm sm:mt-5 sm:flex-row sm:flex-wrap sm:justify-center sm:text-base lg:mt-[20px] lg:text-[20px]">
          {settings?.contactEmail ? (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="flex min-w-0 items-center gap-1 hover:opacity-80"
            >
              <Image
                src="/assets/icons/icon-email.svg"
                alt=""
                width={16}
                height={16}
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="break-words">{settings.contactEmail}</span>
            </a>
          ) : null}
          {addressLine ? (
            <span className="flex min-w-0 max-w-full items-center gap-1">
              <Image
                src="/assets/icons/icon-location-pin.svg"
                alt=""
                width={16}
                height={16}
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="break-words">{addressLine}</span>
            </span>
          ) : null}
        </div>

        <SocialLinks links={social} className="mt-6 flex items-center gap-4 sm:mt-8 lg:mt-[34px]" />
      </Reveal>

      <div className="flex min-h-[58px] items-center justify-center bg-[linear-gradient(90deg,#4865a9_0%,#73abd2_100%)] px-6 py-3 text-center font-sans text-sm text-white sm:text-base lg:text-[20px]">
        <span className="break-words">{settings?.footerTagline}</span>
      </div>
    </footer>
  );
}
