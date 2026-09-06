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

/** Continuous autoplay drift speed, in card-widths per second — a slow conveyor pan, not a tick. */
const AUTOPLAY_SPEED = 0.22;
/** Minimum horizontal drag, in px, before a pointer gesture counts as a swipe (not a tap). */
const SWIPE_THRESHOLD_PX = 40;
/** How long a manual interaction (button/swipe) suppresses autoplay before it resumes. */
const MANUAL_PAUSE_MS = 2200;

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

/** Max tilt/shrink applied only to cards right at the viewport's edge — see ConveyorCard. */
const EDGE_MAX_ROTATE_DEG = 16;
const EDGE_MAX_SCALE_DROP = 0.08;

/**
 * One card's slot in the horizontal conveyor, derived from its fixed index and the carousel's
 * continuous (never-snapping) `position` value: `offset` is the signed distance from the
 * *track's own center* (in card-width units, since a card sits centered when offset is 0),
 * wrapped to the shortest path around the loop so the math never needs to know about a "start"
 * or "end" of the list. `x` is a plain horizontal translate — the whole strip's motion is just
 * that, no scale/rotation drives the actual conveying. `rotateY`/`scale` add a light bend that
 * only kicks in within the last card-or-so of the visible span (an ease-in curve of the same
 * `edgeT` used below), matching where the curved backdrop from CategoryNav bulges — cards stay
 * flat rectangles across the vast majority of the strip and only tilt as they genuinely reach
 * the edge of the panoramic window, so it reads as entering/leaving a curved surface rather than
 * a per-card 3D effect.
 */
function ConveyorCard({
  category,
  index,
  total,
  position,
  cardWidth,
  visibleCount,
}: {
  category: CategoryCardData;
  index: number;
  total: number;
  position: MotionValue<number>;
  cardWidth: number;
  visibleCount: number;
}) {
  const offset = useTransform(position, (pos) => {
    let raw = (index - pos) % total;
    if (raw > total / 2) raw -= total;
    if (raw < -total / 2) raw += total;
    return raw;
  });
  const x = useTransform(offset, (o) => o * cardWidth);

  const halfSpan = visibleCount / 2;
  const edgeT = useTransform(offset, (o) => Math.min(Math.abs(o) / halfSpan, 1) ** 2);
  const rotateY = useTransform([offset, edgeT], ([o, t]) => Math.sign(o as number) * (t as number) * -EDGE_MAX_ROTATE_DEG);
  const scale = useTransform(edgeT, (t) => 1 - t * EDGE_MAX_SCALE_DROP);

  return (
    <motion.div
      className="absolute top-0 left-1/2 h-full will-change-transform"
      style={{
        marginLeft: -cardWidth / 2,
        width: cardWidth,
        x,
        rotateY,
        scale,
        transformPerspective: 900,
      }}
    >
      <div className="h-full px-2 sm:px-2.5 lg:px-3">
        <CategoryCard category={category} />
      </div>
    </motion.div>
  );
}

/**
 * Horizontal conveyor/panorama carousel: cards live at fixed indices, and a single continuous
 * `position` value (never a discrete step index) drives every card's `x` via ConveyorCard
 * above. Looping is just modulo arithmetic on that continuous value — there's no clone array
 * and no "snap back" moment, so the wrap is inherently seamless. Autoplay advances `position`
 * every animation frame (a slow drift, not a tick); buttons, keyboard and drag all move the
 * same value with spring easing (or live 1:1 tracking while dragging) instead of jumping.
 *
 * Cards themselves are plain flat rounded rectangles the whole time — per the source Figma file
 * (node 70:5), each card is a simple rounded-rectangle, never a warped or clipped shape. The
 * panoramic/cylinder feel comes entirely from two large ellipses sitting *behind* the strip as a
 * decorative backdrop (matching the source 1:1: two ellipse layers, not a per-card effect),
 * peeking out above, below and slightly past the sides of the row — nothing about them ever
 * touches or masks a card.
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
    // long-lived tab — ConveyorCard's own modulo math makes this a visual no-op.
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
      const deltaPx = event.clientX - startX;
      if (Math.abs(deltaPx) > SWIPE_THRESHOLD_PX / 2) suppressClickRef.current = true;
      position.set(dragStartPositionRef.current - deltaPx / cardWidth);
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
      {/* Panoramic "track" backdrop, straight from the reference: two wide, flat ellipses sitting
          behind the strip, peeking out above, below and slightly past its sides. Cards stay
          plain flat rectangles the whole time — this is purely a decorative background shape,
          not a mask or clip on the cards. Sized as percentages of the track's own box so it
          scales cleanly at every breakpoint without per-breakpoint tuning. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-0 rounded-[50%] bg-entaj-light-grey"
        style={{ left: "-6%", top: "-58%", width: "112%", height: "78%" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-0 rounded-[50%] bg-entaj-light-grey"
        style={{ left: "-6%", top: "80%", width: "112%", height: "78%" }}
      />

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
        className="relative z-10 h-45 touch-pan-y select-none overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue sm:h-50 lg:h-57"
      >
        {cardWidth > 0
          ? categories.map((category, i) => (
              <ConveyorCard
                key={category.id}
                category={category}
                index={i}
                total={total}
                position={position}
                cardWidth={cardWidth}
                visibleCount={visibleCount}
              />
            ))
          : null}
      </div>

      <button
        type="button"
        aria-label="Previous categories"
        onClick={handlePrev}
        className="absolute top-1/2 -left-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-entaj-blue shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-entaj-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue sm:-left-4"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Next categories"
        onClick={handleNext}
        className="absolute top-1/2 -right-3 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-entaj-blue shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-entaj-light-grey focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue sm:-right-4"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
