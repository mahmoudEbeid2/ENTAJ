"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Single source of truth for the tick cadence — change this one value to retime autoplay. */
const AUTOPLAY_INTERVAL_MS = 1000;
/** Must stay below AUTOPLAY_INTERVAL_MS or the next tick fires mid-transition. */
const TRANSITION_MS = 400;
/** Minimum horizontal drag, in px, before a pointer gesture counts as a swipe (not a tap). */
const SWIPE_THRESHOLD_PX = 40;

export interface CategoryCardData {
  id: number;
  slug: string;
  name: string;
  bgColor: string | null;
  iconSrc: string | null;
}

function useVisibleCount() {
  const [visibleCount, setVisibleCount] = useState(2);
  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const update = () => setVisibleCount(lg.matches ? 5 : sm.matches ? 3 : 2);
    update();
    sm.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, []);
  return visibleCount;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function CategoryCard({ category, widthPercent }: { category: CategoryCardData; widthPercent: number }) {
  return (
    <div className="shrink-0 px-2 sm:px-2.5 lg:px-3" style={{ width: `${widthPercent}%` }}>
      <Link
        href={`/divisions/${category.slug}`}
        style={{ backgroundColor: category.bgColor || "#EDEDED" }}
        className="flex min-h-[180px] flex-col rounded-3xl pt-6 pb-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(20,30,80,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue sm:min-h-[200px] sm:pt-8 sm:pb-6 lg:min-h-[228px]"
        draggable={false}
      >
        <div className="relative mx-auto aspect-square w-[52%] sm:w-[56%] lg:w-[60%]">
          {category.iconSrc ? (
            <Image
              src={category.iconSrc}
              alt=""
              fill
              sizes="160px"
              className="pointer-events-none object-contain"
              aria-hidden="true"
              draggable={false}
            />
          ) : null}
        </div>
        <div className="flex flex-1 items-end justify-center px-2 pt-3 sm:pt-4">
          <span className="font-expanded text-center text-xs leading-snug font-bold uppercase tracking-wide text-[#2F2F2F] sm:text-sm">
            {category.name}
          </span>
        </div>
      </Link>
    </div>
  );
}

/**
 * Discrete-step, transform-driven carousel: one card moves in from the right and one moves
 * out on the left per tick, like the "next" button being clicked — never a continuous
 * marquee. Looping is seamless (no jump/rewind at the wrap point) via a small number of
 * cloned cards at each end of the track; once a step lands on a clone, the transition is
 * switched off for exactly one frame to snap back to the equivalent real position, then
 * switched back on before the next tick.
 */
export function CategoryNav({ categories }: { categories: CategoryCardData[] }) {
  const visibleCount = useVisibleCount();
  const reducedMotion = useReducedMotion();
  const hasEnoughToScroll = categories.length > visibleCount;

  const cloneCount = Math.min(visibleCount, categories.length);
  const extended = useMemo(() => {
    if (!hasEnoughToScroll) return categories;
    return [...categories.slice(-cloneCount), ...categories, ...categories.slice(0, cloneCount)];
  }, [categories, cloneCount, hasEnoughToScroll]);

  const [index, setIndex] = useState(cloneCount);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  // Re-anchor to the first real card whenever the clone count changes (breakpoint change) or
  // the category list itself changes, instead of drifting off into stale clone territory.
  useLayoutEffect(() => {
    setTransitionEnabled(false);
    setIndex(cloneCount);
  }, [cloneCount, categories.length]);

  useLayoutEffect(() => {
    if (transitionEnabled) return;
    const raf = requestAnimationFrame(() => setTransitionEnabled(true));
    return () => cancelAnimationFrame(raf);
  }, [transitionEnabled]);

  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const manualPauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setIsIntersecting(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setIsTabHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => () => clearTimeout(manualPauseTimeoutRef.current), []);

  const advance = useCallback((direction: 1 | -1) => {
    setIndex((i) => i + direction);
  }, []);

  const handleTransitionEnd = useCallback(() => {
    if (!hasEnoughToScroll) return;
    if (index >= cloneCount + categories.length) {
      setTransitionEnabled(false);
      setIndex(index - categories.length);
    } else if (index < cloneCount) {
      setTransitionEnabled(false);
      setIndex(index + categories.length);
    }
  }, [index, cloneCount, categories.length, hasEnoughToScroll]);

  // Reduced motion never animates, so no transitionend fires to trigger the wrap above —
  // resolve it synchronously instead.
  useLayoutEffect(() => {
    if (!reducedMotion || !hasEnoughToScroll) return;
    if (index >= cloneCount + categories.length) {
      setIndex(index - categories.length);
    } else if (index < cloneCount) {
      setIndex(index + categories.length);
    }
  }, [reducedMotion, hasEnoughToScroll, index, cloneCount, categories.length]);

  const triggerManualPause = useCallback(() => {
    setManualPause(true);
    clearTimeout(manualPauseTimeoutRef.current);
    manualPauseTimeoutRef.current = setTimeout(() => setManualPause(false), AUTOPLAY_INTERVAL_MS);
  }, []);

  const handlePrev = useCallback(() => {
    advance(-1);
    triggerManualPause();
  }, [advance, triggerManualPause]);

  const handleNext = useCallback(() => {
    advance(1);
    triggerManualPause();
  }, [advance, triggerManualPause]);

  const isPaused = isHovering || isFocused || isDragging || manualPause || !isIntersecting || isTabHidden;
  const autoplayActive = !reducedMotion && hasEnoughToScroll && !isPaused;

  useEffect(() => {
    if (!autoplayActive) return;
    const id = setInterval(() => advance(1), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoplayActive, advance]);

  // Pointer-driven swipe: measured against the track itself so it works with mouse drag too,
  // not just touch. A drag that clears SWIPE_THRESHOLD_PX suppresses the Link's click so a
  // swipe never also navigates.
  const dragStartXRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragStartXRef.current = event.clientX;
    setIsDragging(true);
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const startX = dragStartXRef.current;
      dragStartXRef.current = null;
      setIsDragging(false);
      if (startX === null) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
      suppressClickRef.current = true;
      advance(delta < 0 ? 1 : -1);
      triggerManualPause();
    },
    [advance, triggerManualPause],
  );

  const handlePointerCancel = useCallback(() => {
    dragStartXRef.current = null;
    setIsDragging(false);
  }, []);

  const handleTrackClickCapture = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      }
    },
    [handleNext, handlePrev],
  );

  if (categories.length === 0) return null;

  const widthPercent = 100 / visibleCount;
  const translatePercent = index * widthPercent;

  if (!hasEnoughToScroll) {
    return (
      <div className="-mx-2 flex flex-wrap sm:-mx-2.5 lg:-mx-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} widthPercent={widthPercent} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Product categories"
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
    >
      <div className="-mx-2 overflow-hidden sm:-mx-2.5 lg:-mx-3">
        <div
          role="group"
          aria-live={autoplayActive ? "off" : "polite"}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTransitionEnd={handleTransitionEnd}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClickCapture={handleTrackClickCapture}
          className="flex touch-pan-y select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue"
          style={{
            transform: `translate3d(-${translatePercent}%, 0, 0)`,
            transition:
              transitionEnabled && !reducedMotion ? `transform ${TRANSITION_MS}ms ease-out` : "none",
          }}
        >
          {extended.map((category, i) => (
            <CategoryCard key={`${category.id}-${i}`} category={category} widthPercent={widthPercent} />
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous categories"
        onClick={handlePrev}
        className={cn(
          "absolute top-1/2 -left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-entaj-blue shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-entaj-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue sm:-left-4",
        )}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Next categories"
        onClick={handleNext}
        className={cn(
          "absolute top-1/2 -right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-entaj-blue shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-entaj-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue sm:-right-4",
        )}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
