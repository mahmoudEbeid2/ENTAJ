import Image from "next/image";

const DASHED_FRAME_SRC = "/assets/illustrations/about-dashed-frame.svg";

export function AboutShowcase({
  eyebrow,
  heading,
  body,
  imageSrc,
  imageAlt,
  blobSrc,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  blobSrc?: string | null;
}) {
  const [headingFirst, ...headingRest] = heading.split(" ");
  const headingSecond = headingRest.join(" ");
  const paragraphs = body.split("\n\n").filter(Boolean);

  return (
    <div>
      {/* Desktop: pixel-matched to the Figma composition (1254x250 cluster) */}
      <div className="relative mx-auto hidden h-[250px] w-[1254px] lg:block">
        <div className="absolute left-[150px] top-0 h-[250px] w-[699.92px]">
          <Image src={DASHED_FRAME_SRC} alt="" fill aria-hidden className="pointer-events-none select-none" />
          <div
            className="absolute left-[183px] top-[15px] w-[475px] text-black"
            style={{ fontFamily: "var(--font-saira)", fontSize: "16px", lineHeight: "17px" }}
          >
            {paragraphs.map((paragraph, i) => (
              <p key={i} className={i < paragraphs.length - 1 ? "mb-[17px]" : ""}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {blobSrc ? (
          <div className="absolute left-0 top-[31px] z-10 h-[189px] w-[315px]">
            <Image src={blobSrc} alt="" fill className="pointer-events-none select-none object-contain" />
            <div
              className="absolute left-[28px] top-[54px] w-[136px] text-center font-extrabold text-white"
              style={{ fontFamily: "var(--font-saira)", fontStretch: "100%", fontSize: "40.518px", lineHeight: "48px" }}
            >
              {eyebrow.split(" ").map((word, i) => (
                <span key={i} className="block">
                  {word}
                </span>
              ))}
            </div>
            <div
              className="absolute left-[219px] top-[80px] w-[90px] font-bold text-white"
              style={{ fontFamily: "var(--font-saira)", fontStretch: "112.5%", fontSize: "21.563px", lineHeight: "23px" }}
            >
              <span className="block">{headingFirst}?</span>
              <span className="block">{headingSecond}</span>
            </div>
          </div>
        ) : null}

        <div className="absolute right-0 top-[19px] h-[213px] w-[378px] overflow-hidden rounded-[24px]">
          <Image src={imageSrc} alt={imageAlt} fill sizes="378px" className="object-cover" />
        </div>
      </div>

      {/* Mobile / tablet fallback: same pieces, stacked */}
      <div className="mx-auto flex max-w-[520px] flex-col items-center gap-6 text-center lg:hidden">
        {blobSrc ? (
          <div className="relative h-[120px] w-[199px] shrink-0">
            <Image src={blobSrc} alt="" fill className="pointer-events-none select-none object-contain" />
            <div
              className="absolute left-[18px] top-[34px] w-[86px] text-center font-extrabold text-white"
              style={{ fontFamily: "var(--font-saira)", fontSize: "25px", lineHeight: "28px" }}
            >
              {eyebrow.split(" ").map((word, i) => (
                <span key={i} className="block">
                  {word}
                </span>
              ))}
            </div>
            <div
              className="absolute left-[139px] top-[51px] w-[57px] font-bold text-white"
              style={{ fontFamily: "var(--font-saira)", fontStretch: "112.5%", fontSize: "13px", lineHeight: "15px" }}
            >
              <span className="block">{headingFirst}?</span>
              <span className="block">{headingSecond}</span>
            </div>
          </div>
        ) : null}

        <div className="relative w-full rounded-[32px] border-2 border-dashed border-entaj-blue/60 px-6 py-5">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className={`text-sm leading-relaxed text-black ${i < paragraphs.length - 1 ? "mb-3" : ""}`}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="relative aspect-[378/213] w-full max-w-[320px] overflow-hidden rounded-[24px]">
          <Image src={imageSrc} alt={imageAlt} fill sizes="320px" className="object-cover" />
        </div>
      </div>
    </div>
  );
}
