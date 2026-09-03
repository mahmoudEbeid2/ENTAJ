"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryCardData {
  id: number;
  slug: string;
  name: string;
  bgColor: string | null;
  iconSrc: string | null;
}

const PRIMARY_COUNT = 5;

function CategoryCard({ category, widthClassName }: { category: CategoryCardData; widthClassName: string }) {
  return (
    <Link
      href={`/divisions/${category.slug}`}
      data-category-card
      style={{ backgroundColor: category.bgColor || "#EDEDED" }}
      className={cn(
        "flex min-h-[180px] shrink-0 snap-start flex-col rounded-3xl pt-6 pb-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(20,30,80,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue sm:min-h-[200px] sm:pt-8 sm:pb-6 lg:min-h-[228px]",
        widthClassName,
      )}
    >
      <div className="relative mx-auto aspect-square w-[52%] sm:w-[56%] lg:w-[60%]">
        {category.iconSrc ? (
          <Image src={category.iconSrc} alt="" fill sizes="160px" className="object-contain" aria-hidden="true" />
        ) : null}
      </div>
      <div className="flex flex-1 items-end justify-center px-2 pt-3 sm:pt-4">
        <span className="font-expanded text-center text-xs leading-snug font-bold uppercase tracking-wide text-[#2F2F2F] sm:text-sm">
          {category.name}
        </span>
      </div>
    </Link>
  );
}

/**
 * Remaining-categories rail: manual, non-looping horizontal scroller (arrow
 * buttons + keyboard + native touch swipe via scroll-snap). No auto-advance
 * per spec — arrows disable themselves at either end instead of wrapping.
 */
function OverflowSlider({ categories }: { categories: CategoryCardData[] }) {
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
      const step = (card?.offsetWidth ?? el.clientWidth / PRIMARY_COUNT) + gap;
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
    <div className="relative mt-4 lg:mt-6">
      <div
        ref={scrollerRef}
        role="region"
        aria-label="More product categories"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth rounded-2xl pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue sm:gap-5 lg:gap-6"
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            widthClassName="w-[calc((100%-16px)/2)] sm:w-[calc((100%-40px)/3)] lg:w-[calc((100%-96px)/5)]"
          />
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

/**
 * Category section: the first PRIMARY_COUNT categories (by sort_order, as
 * returned by getCategories()) always render as a fixed row — a real 5-col
 * CSS grid at lg+ where all 5 fit with no scrolling, collapsing to a
 * horizontally-scrollable snap track below that (never a vertical stack of
 * full-width cards). Any remaining categories render in a separate,
 * manually-driven OverflowSlider underneath. Purely data-driven: the 5/rest
 * split follows category count, not a fixed layout.
 */
export function CategoryNav({ categories }: { categories: CategoryCardData[] }) {
  if (categories.length === 0) return null;

  const primary = categories.slice(0, PRIMARY_COUNT);
  const overflow = categories.slice(PRIMARY_COUNT);

  return (
    <div>
      <div
        className="scrollbar-hide grid grid-flow-col auto-cols-[calc((100%-16px)/2)] gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:auto-cols-[calc((100%-40px)/3)] sm:gap-5 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:pb-0 lg:snap-none"
        aria-label="Product categories"
      >
        {primary.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            widthClassName="w-[calc((100%-16px)/2)] sm:w-[calc((100%-40px)/3)] lg:w-auto"
          />
        ))}
      </div>

      <OverflowSlider categories={overflow} />
    </div>
  );
}
