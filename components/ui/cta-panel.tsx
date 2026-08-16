import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaPanel({
  variant = "dark",
  heading,
  subheading,
  body,
  iconSrc,
  illustrationSrc,
  buttonLabel,
  buttonHref,
  email,
  address,
}: {
  variant?: "dark" | "light";
  heading: string;
  subheading?: string | null;
  body: string;
  iconSrc?: string | null;
  illustrationSrc?: string | null;
  buttonLabel?: string | null;
  buttonHref?: string | null;
  email?: string | null;
  address?: string | null;
}) {
  const isLight = variant === "light";
  const bodyBlocks = body.split("\n\n");

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[32px] px-8 py-10 sm:rounded-[45px] lg:px-14 lg:py-14",
        isLight ? "bg-[#f3f3f3]" : "bg-gradient-entaj text-white",
      )}
    >
      <div className={cn("relative grid gap-8 lg:grid-cols-[1fr_auto]", isLight ? "lg:items-start" : "lg:items-end")}>
        <div>
          {iconSrc ? (
            <Image src={iconSrc} alt="" width={48} height={48} className="mb-4 size-10" aria-hidden="true" />
          ) : null}
          <h2
            className={cn(
              "font-expanded text-[40px] font-thin leading-[normal] lg:text-[67px]",
              isLight ? "text-entaj-light-blue" : "text-white lg:whitespace-nowrap",
            )}
          >
            {heading}
          </h2>
          {isLight && subheading ? (
            <p className="mt-4 font-sans text-lg font-bold leading-normal text-entaj-blue lg:text-xl">{subheading}</p>
          ) : null}
          {isLight ? (
            <div className="mt-4 max-w-xl whitespace-pre-line text-sm font-light leading-relaxed text-entaj-dark-grey lg:text-base">
              {body}
            </div>
          ) : (
            <div className="mt-4 max-w-2xl space-y-4 font-sans text-sm leading-relaxed text-white/90 lg:text-base">
              {bodyBlocks.map((block, i) => {
                const lines = block.split("\n").filter(Boolean);
                const isList = lines.length > 0 && lines.every((line) => line.trimStart().startsWith("• "));
                if (isList) {
                  return (
                    <ul key={i} className="list-disc space-y-1 pl-6">
                      {lines.map((line, j) => (
                        <li key={j}>{line.trimStart().replace(/^•\s*/, "")}</li>
                      ))}
                    </ul>
                  );
                }
                const isLast = i === bodyBlocks.length - 1;
                return (
                  <p key={i} className={isLast ? "font-normal" : "font-bold"}>
                    {block}
                  </p>
                );
              })}
            </div>
          )}
          {email || address ? (
            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-xl text-[#666]">
              {email ? (
                <a href={`mailto:${email}`} className="flex items-center gap-1 hover:opacity-80">
                  <Image src="/assets/icons/icon-email-dark.svg" alt="" width={16} height={16} className="size-4" aria-hidden="true" />
                  {email}
                </a>
              ) : null}
              {address ? (
                <span className="flex items-center gap-1">
                  <Image src="/assets/icons/icon-location-pin-dark.svg" alt="" width={16} height={16} className="size-4" aria-hidden="true" />
                  {address}
                </span>
              ) : null}
            </div>
          ) : null}
          {!isLight && buttonLabel && buttonHref ? (
            <Button
              render={<Link href={buttonHref} />}
              className="mt-6 h-[52px] rounded-full px-8 text-base bg-white text-entaj-blue transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-lg"
            >
              {buttonLabel}
            </Button>
          ) : null}
        </div>
        {illustrationSrc ? (
          <div
            className={cn(
              "relative mx-auto shrink-0",
              isLight
                ? "h-[220px] w-[187px] rounded-[20px] border border-entaj-light-blue/30 sm:h-[264px] sm:w-[224px] sm:rounded-[24px]"
                : "h-[103px] w-[125px] sm:h-[125px] sm:w-[152px]",
            )}
          >
            <Image src={illustrationSrc} alt="" fill sizes="224px" className="object-contain p-4" aria-hidden="true" />
          </div>
        ) : null}
      </div>
      {isLight && buttonLabel && buttonHref ? (
        <Button
          render={<Link href={buttonHref} />}
          className="relative mt-8 h-[52px] w-full rounded-full bg-entaj-blue text-base text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-entaj-blue/90 hover:shadow-lg"
        >
          {buttonLabel}
        </Button>
      ) : null}
    </div>
  );
}
