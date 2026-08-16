"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductCard } from "@/components/ui/product-card";
import { Reveal } from "@/components/ui/reveal";

const INITIAL_DISPLAY_COUNT = 6;

export interface RecommendedProduct {
  id: number;
  name: string;
  imageSrc?: string | null;
  featured?: boolean;
}

export function RecommendedGrid({ products }: { products: RecommendedProduct[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = products.length > INITIAL_DISPLAY_COUNT;
  const visible = expanded || !hasMore ? products : products.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-[52px] lg:gap-y-[70px]">
        {visible.map((product, index) => {
          const card = <ProductCard name={product.name} imageSrc={product.imageSrc} featured={product.featured} />;
          // First batch reveals on scroll; cards revealed by "Expand" animate in on mount instead,
          // since they may already be within the viewport when the button is clicked.
          if (index < INITIAL_DISPLAY_COUNT) {
            return (
              <Reveal key={product.id} delay={index * 70}>
                {card}
              </Reveal>
            );
          }
          return (
            <div
              key={product.id}
              className="animate-in fade-in slide-in-from-bottom-4 animation-fill-mode-both duration-500 ease-out"
              style={{ animationDelay: `${Math.min((index - INITIAL_DISPLAY_COUNT) * 60, 360)}ms` }}
            >
              {card}
            </div>
          );
        })}
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-12 flex w-full items-center justify-center gap-2 rounded-full bg-entaj-light-grey py-4 text-entaj-dark-grey transition-all duration-200 hover:-translate-y-0.5 hover:bg-entaj-light-grey/70"
          aria-expanded={expanded}
        >
          <Image
            src="/assets/icons/icon-chevron-expand.svg"
            alt=""
            width={14}
            height={12}
            className={`transition-transform duration-300 ease-out ${expanded ? "size-3 rotate-180" : "size-3"}`}
            aria-hidden="true"
          />
          <span className="font-expanded text-sm font-semibold tracking-widest">
            {expanded ? "SHOW LESS" : "EXPAND"}
          </span>
        </button>
      ) : null}
    </div>
  );
}
