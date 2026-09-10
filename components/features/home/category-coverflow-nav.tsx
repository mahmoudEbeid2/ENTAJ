"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/** How long the centered card sits before auto-advancing to the next one. */
const AUTOPLAY_INTERVAL_MS = 2600;
/** Minimum horizontal drag, in px, before a pointer gesture counts as a swipe (not a tap). */
const DRAG_THRESHOLD_PX = 6;

export interface CategoryCardData {
  id: number;
  slug: string;
  name: string;
  bgColor: string | null;
  iconSrc: string | null;
}

/** Tracks an element's rendered width so the coverflow spacing is derived from real layout
 * instead of a guessed breakpoint pixel value. */
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.offsetWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function CategoryCard({
  category,
  active,
  onClick,
}: {
  category: CategoryCardData;
  active?: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={`/divisions/${category.slug}`}
      onClick={onClick}
      style={{
        background: active ? category.bgColor || "#EDEDED" : "linear-gradient(180deg, #7db3dd 0%, #4d72b0 100%)",
        boxShadow: active
          ? `0 25px 60px -10px ${category.bgColor || "#000000"}8c, 0 0 90px 6px ${category.bgColor || "#000000"}59`
          : undefined,
        transition: "background 0.6s ease, box-shadow 0.75s ease",
      }}
      className="flex h-full w-full flex-col items-center justify-center gap-4 rounded-3xl px-2 py-6 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue sm:gap-5 sm:py-8"
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
 * Coverflow-style carousel, ported from the approved reference animation: cards sit at fixed
 * indices around a single centered "current" one. Distance-from-center alone drives each card's
 * transform (translateX + scale), opacity and blur — the centered card is largest/sharpest, and
 * cards fade, shrink and blur the further they sit from center. Autoplay steps `current` forward
 * on an interval (paused on hover/drag); dragging follows the pointer live and settles on the
 * nearest card on release. Clicking a non-centered card brings it to center instead of
 * navigating; clicking the already-centered card navigates through its own Link.
 */
export function CategoryCoverflowNav({ categories }: { categories: CategoryCardData[] }) {
  const total = categories.length;
  const hasEnoughToScroll = total > 1;
  const reducedMotion = useReducedMotionPreference();

  const [current, setCurrent] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const wasDraggedRef = useRef(false);
  const pointerDownRef = useRef(false);
  const dragStartXRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cardRef, cardWidth] = useElementWidth<HTMLDivElement>();
  const spacing = cardWidth * 0.98;

  const restart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isHovering || reducedMotion || !hasEnoughToScroll) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, AUTOPLAY_INTERVAL_MS);
  }, [isHovering, reducedMotion, hasEnoughToScroll, total]);

  useEffect(() => {
    restart();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restart]);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total);
      restart();
    },
    [total, restart],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(current + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(current - 1);
      }
    },
    [current, goTo],
  );

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    pointerDownRef.current = true;
    wasDraggedRef.current = false;
    dragStartXRef.current = event.clientX;
    setDragOffset(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!pointerDownRef.current) return;
      const offset = event.clientX - dragStartXRef.current;
      if (!isDragging && Math.abs(offset) > DRAG_THRESHOLD_PX) {
        setIsDragging(true);
        wasDraggedRef.current = true;
        // Pointer capture is deferred until movement clears the swipe threshold — capturing on
        // every pointerdown (even a plain tap) retargets the click that follows to this track
        // div instead of the card underneath it, silently swallowing navigation on tap.
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.setPointerCapture(event.pointerId);
        }
      }
      if (isDragging || Math.abs(offset) > DRAG_THRESHOLD_PX) {
        setDragOffset(offset);
      }
    },
    [isDragging],
  );

  const settleDrag = useCallback(() => {
    pointerDownRef.current = false;
    if (!isDragging) return;
    setIsDragging(false);
    const steps = spacing > 0 ? Math.round(-dragOffset / spacing) : 0;
    if (steps !== 0) {
      setCurrent((c) => ((c + steps) % total + total) % total);
    }
    setDragOffset(0);
    restart();
    // Cleared on the next tick so a click fired by this same gesture is still caught first.
    setTimeout(() => {
      wasDraggedRef.current = false;
    }, 0);
  }, [isDragging, dragOffset, spacing, total, restart]);

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      settleDrag();
    },
    [settleDrag],
  );

  const handleCardClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, index: number) => {
      if (wasDraggedRef.current) {
        event.preventDefault();
        return;
      }
      if (index !== current) {
        // Not the centered card yet — bring it to center instead of navigating.
        event.preventDefault();
        goTo(index);
      }
      // If it IS the centered card, let the click through to navigate to its href.
    },
    [current, goTo],
  );

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
      role="region"
      aria-roledescription="carousel"
      aria-label="Product categories"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        settleDrag();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`relative h-[220px] touch-pan-y select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue sm:h-[300px] ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {categories.map((category, i) => {
        let diff = i - current;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
        const abs = Math.abs(diff);
        const extraOffset = isDragging ? dragOffset : 0;
        const x = diff * spacing + extraOffset;
        const scale = abs === 0 ? 1.28 : abs === 1 ? 1 : abs === 2 ? 0.8 : 0.62;
        const opacity = abs === 0 ? 1 : abs === 1 ? 0.9 : abs === 2 ? 0.55 : 0.28;
        const blur = abs <= 1 ? 0 : abs === 2 ? 1 : 2.5;
        const isActive = diff === 0 && extraOffset === 0;

        return (
          <div
            key={category.id}
            ref={i === 0 ? cardRef : undefined}
            className="absolute top-1/2 left-1/2 h-[150px] w-[130px] sm:h-[196px] sm:w-[176px]"
            style={{
              transform: `translate(-50%, -50%) translateX(${x}px) scale(${scale})`,
              opacity,
              filter: blur ? `blur(${blur}px)` : "none",
              zIndex: 100 - abs,
              transition: isDragging
                ? "opacity 0.3s ease"
                : "transform 0.75s cubic-bezier(.22,.9,.32,1), opacity 0.75s ease, filter 0.75s ease",
            }}
          >
            <CategoryCard category={category} active={isActive} onClick={(event) => handleCardClick(event, i)} />
          </div>
        );
      })}
    </div>
  );
}

