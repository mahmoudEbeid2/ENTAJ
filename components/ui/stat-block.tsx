import Image from "next/image";
import { AnimatedStatValue } from "@/components/ui/animated-stat-value";

export function StatBlock({
  value,
  label,
  iconSrc,
}: {
  value: string;
  label: string;
  iconSrc?: string | null;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {iconSrc ? (
        <Image src={iconSrc} alt="" width={59} height={59} className="size-[58.333px]" aria-hidden="true" />
      ) : null}
      <AnimatedStatValue
        value={value}
        className="text-[48px] font-bold leading-[normal] lg:text-[80.421px] lg:leading-[95.27px]"
        style={{
          backgroundImage: "linear-gradient(95deg, #4A69AB -11.08%, #74ACD3 79.8%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      />
      <span className="text-[20px] font-normal leading-[48px] text-[#4d4d4d]">{label}</span>
    </div>
  );
}
