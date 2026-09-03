"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const VISIBLE_DESKTOP = 5;

export interface CategoryCardData {
  id: number;
  slug: string;
  name: string;
  bgColor: string | null;
  iconSrc: string | null;
}

/**
 * Single horizontally-scrolling track holding every category (2 per view on
 * mobile, 3 on tablet, 5 on desktop via the card widths below) — deliberately
 * NOT split into a separate "first 5" block plus a second slider block: two
 * independently-rendered pieces is exactly the shape of bug where one half
 * can silently fail to show while the other looks fine. One track, one
 * render path, so every category the admin creates is unconditionally in the
 * DOM; scrolling (via drag/swipe, the arrow buttons, or arrow keys) is purely
 * how far past the 5th card you can see, not whether the rest exist.
 *
 * Non-looping and no auto-advance by design: arrows disable themselves at
 * either end instead of wrapping, and nothing moves on its own.
 */
export function CategoryNav({ categories }: { categories: CategoryCardData[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

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

  const scrollByCard = useCallback(
    (direction: 1 | -1) => {
      const el = scrollerRef.current;
      if (!el) return;
      const card = el.querySelector<HTMLElement>("[data-category-card]");
      const gap = parseFloat(getComputedStyle(el).columnGap || "0");
      const step = (card?.offsetWidth ?? el.clientWidth / VISIBLE_DESKTOP) + gap;
      el.scrollBy({ left: direction * step, behavior: reducedMotion ? "auto" : "smooth" });
    },
    [reducedMotion],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollByCard(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollByCard(-1);
      }
    },
    [scrollByCard],
  );

  if (categories.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        role="region"
        aria-label="Product categories"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth rounded-2xl pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue sm:gap-5 lg:gap-6"
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
      </div>

      {hasOverflow ? (
        <>
          <button
            type="button"
            aria-label="Previous categories"
            onClick={() => scrollByCard(-1)}
            disabled={!canScrollPrev}
            className="absolute top-1/2 -left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-entaj-blue shadow-lg transition-all duration-150 hover:scale-105 hover:bg-entaj-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue disabled:pointer-events-none disabled:opacity-30 sm:-left-4"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next categories"
            onClick={() => scrollByCard(1)}
            disabled={!canScrollNext}
            className="absolute top-1/2 -right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-entaj-blue shadow-lg transition-all duration-150 hover:scale-105 hover:bg-entaj-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue disabled:pointer-events-none disabled:opacity-30 sm:-right-4"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
