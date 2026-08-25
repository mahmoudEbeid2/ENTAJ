import Image from "next/image";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  imageSrc,
  imageAlt,
  titleVariant = "solid",
  size = "default",
}: {
  title: string;
  imageSrc: string;
  imageAlt: string;
  /** "stroke" renders an outline-only title (transparent fill) — confirmed via Figma zoom-crop on the Contact page hero only; other pages use solid white. */
  titleVariant?: "solid" | "stroke";
  /** "compact" is a shorter hero — used on Divisions so "OUR CATEGORIES" is reachable without scrolling. */
  size?: "default" | "compact";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        size === "compact"
          ? "h-[280px] sm:h-[340px] lg:h-[440px]"
          : "h-[420px] sm:h-[520px] lg:h-[756px]",
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="animate-in fade-in object-cover duration-1000 ease-out"
      />
      <div className="absolute inset-0 bg-entaj-blue/50" aria-hidden="true" />
      {/* Header is an absolute overlay (see SiteHeaderShell), not a layout sibling, so its
          real height — 96px below lg (py-6 + h-12 logo + py-6), 209.06px at lg+ (pt-[122.06px]
          + h-[63px] logo + pb-6) — has to be subtracted here for the title to center in the
          space actually left below the nav instead of the hero's full height. Only needed for
          "compact": the default hero is tall enough that centering in the full box already
          clears the header with room to spare. */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center justify-center",
          size === "compact" ? "top-[96px] lg:top-[209.06px]" : "top-0",
        )}
      >
        <h1
          className="animate-in fade-in slide-in-from-bottom-4 animation-fill-mode-both font-expanded relative px-6 text-center text-4xl font-thin tracking-wide text-white duration-700 ease-out sm:text-6xl lg:text-8xl"
          style={
            titleVariant === "stroke"
              ? { WebkitTextStroke: "1.5px white", color: "transparent" }
              : undefined
          }
        >
          {title}
        </h1>
      </div>
    </div>
  );
}
