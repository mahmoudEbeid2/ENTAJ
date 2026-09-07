import Image from "next/image";

/** Icon + bold subtitle + paragraph intro block for a category detail page, sourced from
 * Figma node 75:5 ("Safety Equipment & PPE" page, x=21/127 left-aligned to the page's own
 * left margin — NOT centered). Renders only when a category has this content seeded
 * (subtitle + description); older/simpler categories fall back to the plain centered
 * description in the page itself. */
export function CategoryIntro({
  iconSrc,
  title,
  description,
}: {
  iconSrc: string | null;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
      {iconSrc ? (
        <span className="flex size-16 shrink-0 items-center justify-center sm:size-20">
          <Image
            src={iconSrc}
            alt=""
            width={80}
            height={92}
            className="h-auto w-full"
            aria-hidden="true"
          />
        </span>
      ) : null}
      <div>
        <h2 className="font-expanded text-lg font-bold text-entaj-dark-grey sm:text-xl">{title}</h2>
        <p className="mt-2 max-w-2xl font-expanded text-base text-entaj-medium-grey">{description}</p>
      </div>
    </div>
  );
}
