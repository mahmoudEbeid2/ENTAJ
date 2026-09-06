"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";

/** Continuous autoplay drift speed, in card-widths per second — a slow panoramic pan, not a tick. */
const AUTOPLAY_SPEED = 0.22;
/** Minimum horizontal drag, in px, before a pointer gesture counts as a swipe (not a tap). */
const SWIPE_THRESHOLD_PX = 40;
/** How long a manual interaction (button/swipe) suppresses autoplay before it resumes. */
const MANUAL_PAUSE_MS = 2200;
/** Card-width fraction used as the horizontal step between neighboring offsets — kept below 1
 * so cards overlap slightly as they curve away from center, like a panoramic shelf. */
const SPACING_FACTOR = 0.62;

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

/** Tracks an element's rendered width so card sizing/spacing can be derived from real layout
 * instead of guessed breakpoint pixel values. */
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function CategoryCard({ category }: { category: CategoryCardData }) {
  return (
    <Link
      href={`/divisions/${category.slug}`}
      style={{ backgroundColor: category.bgColor || "#EDEDED" }}
      className="flex h-full min-h-[180px] flex-col items-center justify-center gap-4 rounded-3xl px-2 py-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(20,30,80,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue sm:min-h-[200px] sm:gap-5 sm:py-8 lg:min-h-[228px]"
      draggable={false}
    >
      <div className="relative aspect-square w-[52%] sm:w-[56%] lg:w-[60%]">
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
      <span className="font-expanded text-xs leading-snug font-bold uppercase tracking-wide text-[#2F2F2F] sm:text-sm">
        {category.name}
      </span>
    </Link>
  );
}

/**
 * One card's position in the panoramic band, derived from its fixed index and the carousel's
 * continuous (never-snapping) `position` value: `offset` is the signed distance from center,
 * wrapped to the shortest path around the loop so the transform math never has to know about
 * a "start" or "end" of the list. Everything else (x/z/rotateY/scale/opacity) is a pure
 * function of that offset, recomputed by Framer Motion on every position tick without a React
 * re-render — center sits flat and full-size, and cards curve, recede and fade as |offset|
 * grows, exactly like passing through the middle of a curved shelf.
 */
function CoverflowCard({
  category,
  index,
  total,
  position,
  cardWidth,
}: {
  category: CategoryCardData;
  index: number;
  total: number;
  position: MotionValue<number>;
  cardWidth: number;
}) {
  const offset = useTransform(position, (pos) => {
    let raw = (index - pos) % total;
    if (raw > total / 2) raw -= total;
    if (raw < -total / 2) raw += total;
    return raw;
  });

  const spacing = cardWidth * SPACING_FACTOR;
  const x = useTransform(offset, (o) => o * spacing);
  const z = useTransform(offset, (o) => -Math.min(Math.abs(o), 4) * cardWidth * 0.34);
  const rotateY = useTransform(offset, (o) => Math.max(-3.4, Math.min(3.4, o)) * -15);
  const scale = useTransform(offset, (o) => Math.max(0.56, 1.05 - Math.min(Math.abs(o), 3) * 0.16));
  const opacity = useTransform(offset, (o) => {
    const abs = Math.abs(o);
    if (abs <= 1.35) return 1;
    if (abs >= 3) return 0;
    return 1 - (abs - 1.35) / 1.65;
  });
  const zIndex = useTransform(offset, (o) => Math.round(1000 - Math.abs(o) * 10));

  return (
    <motion.div
      className="absolute left-1/2 will-change-transform"
      style={{
        top: "50%",
        marginLeft: -cardWidth / 2,
        width: cardWidth,
        x,
        z,
        rotateY,
        scale,
        opacity,
        zIndex,
      }}
    >
      <div className="-translate-y-1/2 px-2 sm:px-2.5 lg:px-3">
        <CategoryCard category={category} />
      </div>
    </motion.div>
  );
}

/**
 * Panoramic/coverflow carousel: cards live at fixed indices, and a single continuous
 * `position` value (never a discrete step index) drives every card's curve via CoverflowCard
 * above. Looping is just modulo arithmetic on that continuous value — there's no clone array
 * and no "snap back" moment, so the wrap is inherently seamless. Autoplay advances `position`
 * every animation frame (a slow drift, not a tick); buttons, keyboard and drag all move the
 * same value with spring easing (or live 1:1 tracking while dragging) instead of jumping.
 */
export function CategoryNav({ categories }: { categories: CategoryCardData[] }) {
  const visibleCount = useVisibleCount();
  const reducedMotionPreference = useReducedMotion();
  const reducedMotion = reducedMotionPreference ?? false;
  const total = categories.length;
  const hasEnoughToScroll = total > 1;

  const [trackRef, trackWidth] = useElementWidth<HTMLDivElement>();
  const cardWidth = trackWidth > 0 ? trackWidth / visibleCount : 0;

  const position = useMotionValue(0);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

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

  const triggerManualPause = useCallback(() => {
    setManualPause(true);
    clearTimeout(manualPauseTimeoutRef.current);
    manualPauseTimeoutRef.current = setTimeout(() => setManualPause(false), MANUAL_PAUSE_MS);
  }, []);

  const isPaused = isHovering || isFocused || isDragging || manualPause || !isIntersecting || isTabHidden;
  const autoplayActive = !reducedMotion && hasEnoughToScroll && !isPaused;

  useAnimationFrame((_, delta) => {
    if (!autoplayActive) return;
    const next = position.get() + (delta / 1000) * AUTOPLAY_SPEED;
    // Wrap the running total so it never drifts into float-precision territory over a
    // long-lived tab — CoverflowCard's own modulo math makes this a visual no-op.
    position.set(total > 0 ? next % total : next);
  });

  const moveTo = useCallback(
    (target: number) => {
      animationRef.current?.stop();
      if (reducedMotion) {
        position.set(target);
      } else {
        animationRef.current = animate(position, target, {
          type: "spring",
          stiffness: 140,
          damping: 22,
          mass: 0.9,
        });
      }
    },
    [position, reducedMotion],
  );

  const handlePrev = useCallback(() => {
    moveTo(Math.round(position.get()) - 1);
    triggerManualPause();
  }, [moveTo, position, triggerManualPause]);

  const handleNext = useCallback(() => {
    moveTo(Math.round(position.get()) + 1);
    triggerManualPause();
  }, [moveTo, position, triggerManualPause]);

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

  // Pointer-driven drag: the band follows the pointer live (continuous, not a discrete step),
  // then eases to the nearest card on release. A drag that clears SWIPE_THRESHOLD_PX suppresses
  // the Link's click so a swipe never also navigates.
  const dragStartXRef = useRef<number | null>(null);
  const dragStartPositionRef = useRef(0);
  const suppressClickRef = useRef(false);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      animationRef.current?.stop();
      dragStartXRef.current = event.clientX;
      dragStartPositionRef.current = position.get();
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [position],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const startX = dragStartXRef.current;
      if (startX === null || cardWidth === 0) return;
      const spacing = cardWidth * SPACING_FACTOR;
      const deltaPx = event.clientX - startX;
      if (Math.abs(deltaPx) > SWIPE_THRESHOLD_PX / 2) suppressClickRef.current = true;
      position.set(dragStartPositionRef.current - deltaPx / spacing);
    },
    [cardWidth, position],
  );

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (dragStartXRef.current === null) return;
      dragStartXRef.current = null;
      setIsDragging(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      moveTo(Math.round(position.get()));
      if (suppressClickRef.current) triggerManualPause();
    },
    [moveTo, position, triggerManualPause],
  );

  const handleTrackClickCapture = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
    }
  }, []);

  if (total === 0) return null;

  if (!hasEnoughToScroll) {
    return (
      <div className="flex justify-center">
        <div className="w-1/2 px-2 sm:w-1/3 sm:px-2.5 lg:w-1/5 lg:px-3">
          <CategoryCard category={categories[0]} />
        </div>
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
      <div
        ref={trackRef}
        role="group"
        aria-live={autoplayActive ? "off" : "polite"}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleTrackClickCapture}
        className="relative h-54 touch-pan-y select-none overflow-x-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue sm:h-59 lg:h-66"
        style={{ perspective: 1400 }}
      >
        {cardWidth > 0
          ? categories.map((category, i) => (
              <CoverflowCard
                key={category.id}
                category={category}
                index={i}
                total={total}
                position={position}
                cardWidth={cardWidth}
              />
            ))
          : null}
      </div>

      <button
        type="button"
        aria-label="Previous categories"
        onClick={handlePrev}
        className="absolute top-1/2 -left-3 z-1001 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-entaj-blue shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-entaj-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue sm:-left-4"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Next categories"
        onClick={handleNext}
        className="absolute top-1/2 -right-3 z-1001 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-entaj-blue shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-entaj-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue sm:-right-4"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
