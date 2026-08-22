import Image from "next/image";
import { getSiteSettings, getSocialLinks } from "@/lib/data/site";
import { storageUrl } from "@/lib/utils/asset-url";
import { SocialLinks } from "@/components/ui/social-links";
import { Reveal } from "@/components/ui/reveal";

export async function ComingSoonPage() {
  const [settings, social] = await Promise.all([getSiteSettings(), getSocialLinks()]);

  const logoSrc = storageUrl(settings?.footerLogoPath ?? settings?.logoLockupPath ?? settings?.logoPath);
  const siteName = settings?.siteName ?? "ENTAJ";
  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#232f6e_0%,#2c388e_55%,#3d549d_100%)] px-6 py-16 text-white">
      <div
        aria-hidden="true"
        className="animate-float-orb absolute -top-24 -left-24 size-80 rounded-full bg-entaj-light-blue/30 blur-3xl sm:size-[28rem]"
      />
      <div
        aria-hidden="true"
        className="animate-float-orb absolute -right-24 -bottom-24 size-80 rounded-full bg-white/10 blur-3xl [animation-delay:-5s] sm:size-[28rem]"
      />

      <Reveal
        variant="scale"
        duration={900}
        className="relative z-10 flex w-full max-w-xl flex-col items-center text-center"
      >
        {logoSrc ? (
          <Image src={logoSrc} alt={siteName} width={220} height={74} className="h-14 w-auto sm:h-16" priority />
        ) : (
          <span className="font-expanded text-3xl">{siteName}</span>
        )}

        <h1 className="mt-10 font-expanded text-4xl leading-tight font-semibold tracking-wide uppercase sm:text-5xl">
          We&rsquo;ll Be Back Soon
        </h1>

        <p className="mt-5 max-w-md font-sans text-base text-white/80 sm:text-lg">
          Our site is currently undergoing scheduled updates to serve you better. Thank you for your patience
          &mdash; we&rsquo;ll be back online shortly.
        </p>

        <div className="mt-8 flex items-center gap-2" role="status" aria-label="Loading">
          <span className="animate-bounce-dot size-2.5 rounded-full bg-white/80" />
          <span className="animate-bounce-dot size-2.5 rounded-full bg-white/80 [animation-delay:0.15s]" />
          <span className="animate-bounce-dot size-2.5 rounded-full bg-white/80 [animation-delay:0.3s]" />
        </div>

        <div className="mt-10 h-px w-24 bg-white/30" />

        {settings?.contactEmail ? (
          <a
            href={`mailto:${settings.contactEmail}`}
            className="mt-6 flex items-center gap-2 font-sans text-sm text-white/80 transition-opacity hover:opacity-100 sm:text-base"
          >
            <Image
              src="/assets/icons/icon-email.svg"
              alt=""
              width={16}
              height={16}
              className="size-4"
              aria-hidden="true"
            />
            {settings.contactEmail}
          </a>
        ) : null}

        <SocialLinks links={social} className="mt-6 flex items-center gap-4" />

        <p className="mt-10 font-sans text-xs text-white/50">
          &copy; {year} {siteName}. All rights reserved.
        </p>
      </Reveal>
    </div>
  );
}
