import Image from "next/image";

function splitLastTwoWords(text: string) {
  const words = text.split(" ");
  if (words.length <= 2) return [text, ""];
  return [words.slice(0, -2).join(" "), words.slice(-2).join(" ")];
}

export function WhyEntajBanner({
  label,
  heading,
  imageSrc,
}: {
  label: string;
  heading?: string | null;
  imageSrc?: string | null;
}) {
  const [headingLine1, headingLine2] = heading ? splitLastTwoWords(heading) : ["", ""];

  return (
    <div className="relative mb-14 overflow-hidden rounded-[32px] bg-gradient-entaj sm:rounded-[45px] lg:h-[460px]">
      {/* Vertical "WHY ENTAJ" label */}
      <div className="relative flex h-16 shrink-0 items-center justify-center overflow-hidden sm:absolute sm:inset-y-0 sm:left-0 sm:h-auto sm:w-[220px]">
        <span className="font-expanded whitespace-nowrap text-2xl font-light text-white/80 sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rotate-90 sm:text-3xl lg:text-[42px]">
          {label}
        </span>
      </div>

      {/* Photo + gradient panel + heading group — matches the Figma 672.709x317.013 panel exactly, at lg */}
      <div className="relative flex flex-col sm:ml-[130px] lg:absolute lg:left-[220px] lg:top-[52px] lg:ml-0 lg:h-[317px] lg:w-[672.709px]">
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background: "linear-gradient(90deg, #2C388E 0%, #6FA4CE 100%)",
            borderRadius: "0px 137px 0px 85px",
          }}
        />

        <div className="flex flex-col sm:flex-row sm:items-stretch lg:absolute lg:inset-0 lg:flex-row">
          {imageSrc ? (
            <div className="relative mx-6 mt-6 aspect-square shrink-0 overflow-hidden rounded-[20px] sm:mx-0 sm:mt-0 sm:aspect-auto sm:w-[220px] lg:h-full lg:w-[300px] lg:rounded-none">
              <Image src={imageSrc} alt="" fill sizes="300px" className="object-cover" />
            </div>
          ) : null}

          <div className="relative flex flex-1 items-center justify-center px-8 py-10 text-center sm:justify-start sm:px-10 sm:text-left lg:px-12">
            {heading ? (
              <h3 className="font-expanded text-2xl font-thin leading-tight text-white sm:text-[28px] lg:text-[34px]">
                <span className="block">{headingLine1}</span>
                <span className="block">{headingLine2}</span>
              </h3>
            ) : null}
          </div>
        </div>

        <div className="absolute -top-9 right-10 z-10 hidden size-[110px] items-center justify-center rounded-full border-[5px] border-white bg-entaj-blue shadow-lg sm:flex lg:-top-10 lg:right-9 lg:size-[130px]">
          <Image
            src="/assets/illustrations/why-entaj-icon-badge.svg"
            alt=""
            width={39}
            height={39}
            aria-hidden="true"
            className="h-9 w-9 lg:h-10 lg:w-10"
          />
        </div>
      </div>
    </div>
  );
}
