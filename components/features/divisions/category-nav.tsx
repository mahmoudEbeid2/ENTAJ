"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTOPLAY_MS = 2000;

export interface CategoryCardData {
  id: number;
  slug: string;
  name: string;
  bgColor: string | null;
  iconSrc: string | null;
}

/**
 * Horizontally-scrolling category rail: shows ~5 cards at a time (fewer on
 * narrower screens, via the responsive card widths below) with the rest
 * reachable by auto-advancing every AUTOPLAY_MS or the arrow buttons. Native
 * scroll-snap drives the motion so card width/gap never has to be tracked in
 * JS — the arrows and autoplay just scroll by one card's measured width and
 * wrap around at either end.
 */
export function CategoryNav({ categories }: { categories: CategoryCardData[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, categories.length]);

  const hasOverflow = canScrollPrev || canScrollNext;

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-category-card]");
    const gap = parseFloat(getComputedStyle(el).columnGap || "0");
    const step = (card?.offsetWidth ?? el.clientWidth / 5) + gap;

    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
    const atStart = el.scrollLeft <= 4;

    if (direction === 1 && atEnd) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction === -1 && atStart) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    } else {
      el.scrollBy({ left: direction * step, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (!hasOverflow || isPaused) return;
    const id = setInterval(() => scrollByCard(1), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [hasOverflow, isPaused, scrollByCard]);

  if (categories.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <nav
        ref={scrollerRef}
        aria-label="Product categories"
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-5 lg:gap-6"
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/divisions/${category.slug}`}
            data-category-card
            style={{ backgroundColor: category.bgColor || "#EDEDED" }}
            className="flex min-h-[180px] w-[calc((100%-16px)/2)] shrink-0 snap-start flex-col rounded-3xl pt-6 pb-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(20,30,80,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue sm:min-h-[200px] sm:w-[calc((100%-40px)/3)] sm:pt-8 sm:pb-6 lg:min-h-[228px] lg:w-[calc((100%-96px)/5)]"
          >
            <div className="relative mx-auto aspect-square w-[52%] sm:w-[56%] lg:w-[60%]">
              {category.iconSrc ? (
                <Image
                  src={category.iconSrc}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-contain"
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div className="flex flex-1 items-end justify-center px-2 pt-3 sm:pt-4">
              <span className="font-expanded text-center text-xs leading-snug font-bold uppercase tracking-wide text-[#2F2F2F] sm:text-sm">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </nav>

      {hasOverflow ? (
        <>
          <button
            type="button"
            aria-label="Previous categories"
            onClick={() => scrollByCard(-1)}
            className="absolute top-1/2 -left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-entaj-blue shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-entaj-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue sm:-left-4"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next categories"
            onClick={() => scrollByCard(1)}
            className="absolute top-1/2 -right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-entaj-blue shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-entaj-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue sm:-right-4"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
