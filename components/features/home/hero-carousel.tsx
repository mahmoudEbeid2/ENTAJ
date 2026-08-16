"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface HeroSlideImage {
  id: number;
  src: string;
  alt: string;
}

export function HeroCarousel({
  images,
  title,
  subtitle,
  ctaPrimaryLabel,
  ctaPrimaryHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
}: {
  images: HeroSlideImage[];
  title: string;
  subtitle?: string | null;
  ctaPrimaryLabel?: string | null;
  ctaPrimaryHref?: string | null;
  ctaSecondaryLabel?: string | null;
  ctaSecondaryHref?: string | null;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setCurrent((i) => (i + 1) % images.length), 6000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="relative h-dvh min-h-[560px] overflow-hidden">
      {images.map((image, index) => (
        <Image
          key={image.id}
          src={image.src}
          alt={image.alt}
          fill
          priority={index === 0}
          sizes="100vw"
          className="object-cover transition-opacity duration-1000"
          style={{ opacity: index === current ? 1 : 0 }}
        />
      ))}

      <div className="relative flex h-full max-w-[1280px] flex-col items-center justify-center gap-6 px-6 mx-auto text-center lg:justify-start lg:pt-[342.62px] lg:px-10">
        <h1
          className="animate-in fade-in slide-in-from-bottom-4 animation-fill-mode-both mx-auto w-full max-w-[1116px] duration-700 ease-out"
          style={{
            color: "#FFF",
            textAlign: "center",
            fontFamily: '"Saira SemiExpanded", var(--font-saira)',
            fontStretch: "112.5%",
            fontSize: "clamp(28px, 8vw, 48px)",
            fontStyle: "normal",
            fontWeight: 300,
            lineHeight: "normal",
            marginBottom: "15px",
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className="animate-in fade-in slide-in-from-bottom-4 animation-fill-mode-both animation-delay-150 mx-auto w-full max-w-[874px] duration-700 ease-out"
            style={{
              color: "#FFF",
              textAlign: "center",
              fontFamily: "var(--font-saira)",
              fontSize: "clamp(15px, 4vw, 20px)",
              fontStyle: "normal",
              fontWeight: 250,
              lineHeight: "normal",
            }}
          >
            {subtitle.split(/(Entaj)/).map((part, i) =>
              part === "Entaj" ? (
                <strong key={i} className="font-bold">
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </p>
        ) : null}
        {(ctaPrimaryLabel || ctaSecondaryLabel) && (
          <div className="animate-in fade-in slide-in-from-bottom-4 animation-fill-mode-both animation-delay-300 flex flex-wrap justify-center gap-4 pt-2 duration-700 ease-out">
            {ctaSecondaryLabel && ctaSecondaryHref ? (
              <Button
                render={<Link href={ctaSecondaryHref} />}
                className="inline-flex h-[61px] w-[min(310px,100%)] items-center justify-center gap-[10px] rounded-[34px] bg-white p-[10px] shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-lg"
                style={{
                  color: "#374C86",
                  textAlign: "center",
                  fontFamily: "var(--font-saira)",
                  fontSize: "clamp(18px, 5vw, 26px)",
                  fontStyle: "normal",
                  fontWeight: 300,
                  lineHeight: "normal",
                }}
              >
                {ctaSecondaryLabel}
              </Button>
            ) : null}
            {ctaPrimaryLabel && ctaPrimaryHref ? (
              <Button
                render={<Link href={ctaPrimaryHref} />}
                className="h-[61px] w-[min(266px,100%)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg"
                style={{
                  display: "inline-flex",
                  padding: "10px",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  borderRadius: "34px",
                  background: "linear-gradient(90deg, #2E3B90 0%, #72A9D1 100%)",
                  color: "#FFF",
                  textAlign: "center",
                  fontFamily: "var(--font-saira)",
                  fontSize: "clamp(18px, 5vw, 26px)",
                  fontStyle: "normal",
                  fontWeight: 300,
                  lineHeight: "normal",
                }}
              >
                {ctaPrimaryLabel}
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Hero slides">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === current}
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${index === current ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
