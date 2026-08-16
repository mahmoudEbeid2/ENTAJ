"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedStatValue({
  value,
  className,
  style,
}: {
  value: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const match = value.match(/^(\d+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(match ? `0${match[2]}` : value);

  useEffect(() => {
    const currentMatch = value.match(/^(\d+)(.*)$/);
    if (!currentMatch || !ref.current) return;
    const target = parseInt(currentMatch[1], 10);
    const suffix = currentMatch[2];
    const duration = 5000;
    const repeatDelay = 5000;
    let raf = 0;
    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const runCycle = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setDisplay(`${Math.round(progress * target)}${suffix}`);
        if (progress < 1) {
          raf = requestAnimationFrame(tick);
        } else if (!cancelled) {
          timeout = setTimeout(runCycle, repeatDelay);
        }
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        runCycle();
      },
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    return () => {
      cancelled = true;
      observer.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [value]);

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  );
}
