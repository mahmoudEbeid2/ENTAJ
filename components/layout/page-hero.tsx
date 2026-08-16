import Image from "next/image";

export function PageHero({
  title,
  imageSrc,
  imageAlt,
  titleVariant = "solid",
}: {
  title: string;
  imageSrc: string;
  imageAlt: string;
  /** "stroke" renders an outline-only title (transparent fill) — confirmed via Figma zoom-crop on the Contact page hero only; other pages use solid white. */
  titleVariant?: "solid" | "stroke";
}) {
  return (
    <div className="relative flex h-[420px] items-center justify-center overflow-hidden sm:h-[520px] lg:h-[756px]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="animate-in fade-in object-cover duration-1000 ease-out"
      />
      <div className="absolute inset-0 bg-entaj-blue/50" aria-hidden="true" />
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
  );
}
