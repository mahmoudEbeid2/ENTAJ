import Image from "next/image";

const PLATFORM_ICON: Record<string, string> = {
  facebook: "/assets/icons/social-facebook.svg",
  instagram: "/assets/icons/social-instagram.svg",
  linkedin: "/assets/icons/social-linkedin.svg",
  youtube: "/assets/icons/social-youtube.svg",
};

const PLATFORM_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export function SocialLinks({
  links,
  className,
}: {
  links: { id: number; platform: string; url: string }[];
  className?: string;
}) {
  if (links.length === 0) return null;

  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={PLATFORM_LABEL[link.platform] ?? link.platform}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/40 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Image
              src={PLATFORM_ICON[link.platform] ?? "/assets/icons/icon-website-circled.svg"}
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
