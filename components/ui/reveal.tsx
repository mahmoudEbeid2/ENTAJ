"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const HIDDEN_STATE = {
  up: "opacity-0 translate-y-6",
  fade: "opacity-0",
  scale: "opacity-0 scale-95",
} as const;

const MAX_DELAY_MS = 480;

export function Reveal({
  children,
  className,
  variant = "up",
  delay = 0,
  duration = 700,
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof HIDDEN_STATE;
  /** Stagger delay in ms, capped to keep group reveals feeling snappy. */
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "js-reveal transition-[opacity,transform] ease-out",
        visible ? "opacity-100 translate-y-0 scale-100" : HIDDEN_STATE[variant],
        className,
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: delay ? `${Math.min(delay, MAX_DELAY_MS)}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}
