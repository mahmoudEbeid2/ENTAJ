"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CategoryCardDef {
  key: string;
  label: string;
  bgColor: string;
  iconSrc: string;
  iconWidth: number;
  iconHeight: number;
  /** Slug of the real division this card should scroll to, if one exists. */
  divisionSlug?: string;
}

const CATEGORY_CARDS: CategoryCardDef[] = [
  {
    key: "water-treatment",
    label: "WATER TREATMENT",
    bgColor: "#4EC5F9",
    iconSrc: "/assets/icons/icon-category-water-treatment.svg",
    iconWidth: 81,
    iconHeight: 101,
    divisionSlug: "water-treatment",
  },
  {
    key: "feed-additives",
    label: "FEED ADDITIVES",
    bgColor: "#34C759",
    iconSrc: "/assets/icons/icon-category-feed-additives.png",
    iconWidth: 133,
    iconHeight: 87,
    divisionSlug: "animal-nutrition",
  },
  {
    key: "base-oils",
    label: "Base Oils & Petroleum Products",
    bgColor: "#F7DA8D",
    iconSrc: "/assets/icons/icon-category-base-oils.svg",
    iconWidth: 73,
    iconHeight: 99,
    divisionSlug: "base-oils",
  },
  {
    key: "industrial-laundry",
    label: "INDUSTRIAL LAUNDRY DETERGENT",
    bgColor: "#FF6060",
    iconSrc: "/assets/icons/icon-category-industrial-laundry.svg",
    iconWidth: 123,
    iconHeight: 94,
    // Linked whenever this division has DIVISIONS-page spec-table content (division_spec_rows)
    // — independent of whether it has any Product Catalog products. See database/seed.ts.
    divisionSlug: "industrial-laundry-detergent",
  },
  {
    key: "glass-manufacturing",
    label: "GLASS MANUFACTURING RAW MATERIALS",
    bgColor: "#BEBEBE",
    iconSrc: "/assets/icons/icon-category-glass-manufacturing.svg",
    iconWidth: 118,
    iconHeight: 95,
    divisionSlug: "glass-manufacturing-raw-materials",
  },
];

export function CategoryNav({
  availableDivisionSlugs,
  availableCategorySlugs,
}: {
  availableDivisionSlugs?: string[];
  availableCategorySlugs?: string[];
}) {
  const slugs = availableCategorySlugs ?? availableDivisionSlugs ?? CATEGORY_CARDS.map((c) => c.divisionSlug!).filter(Boolean);
  const linkedCards = CATEGORY_CARDS.filter(
    (card) => card.divisionSlug && slugs.includes(card.divisionSlug),
  );
  const [activeSlug, setActiveSlug] = useState(linkedCards[0]?.divisionSlug ?? "");


  useEffect(() => {
    const sections = linkedCards
      .map((card) => document.getElementById(card.divisionSlug!))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    // Tracks intersection per-section (not just the entries in the latest callback batch),
    // then picks the last one in document order that's currently crossing the activation band —
    // sorting by raw top alone would keep a tall earlier section "active" long after a later
    // section has taken over most of the viewport.
    const intersecting = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) intersecting.set(entry.target.id, entry.isIntersecting);
        const active = sections.filter((section) => intersecting.get(section.id));
        if (active.length > 0) setActiveSlug(active[active.length - 1].id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join(",")]);

  return (
    <nav
      aria-label="Product categories"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 lg:gap-6"
    >
      {CATEGORY_CARDS.map((card) => {
        const isLinked = !!card.divisionSlug && slugs.includes(card.divisionSlug);
        const isActive = isLinked && activeSlug === card.divisionSlug;


        const content = (
          <>
            <div className="relative mx-auto aspect-square w-[52%] sm:w-[56%] lg:w-[60%]">
              <Image
                src={card.iconSrc}
                alt=""
                fill
                sizes="160px"
                className="object-contain"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-1 items-end justify-center px-2 pt-3 sm:pt-4">
              <span className="font-expanded text-center text-xs leading-snug font-bold uppercase tracking-wide text-[#2F2F2F] sm:text-sm">
                {card.label}
              </span>
            </div>
          </>
        );

        const cardClassName = cn(
          // No forced aspect-square: a 3-line label at 2-column mobile widths needs more
          // height than a 60%-width icon + text can fit inside a fixed square without
          // clipping. Height instead follows content, and CSS Grid keeps cards in the same
          // row equal height automatically.
          "flex min-h-[180px] flex-col rounded-3xl pt-6 pb-5 transition-all duration-200 sm:min-h-[200px] sm:pt-8 sm:pb-6 lg:min-h-[228px]",
          isLinked && "hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_rgba(20,30,80,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-entaj-blue",
          isActive && "ring-4 ring-entaj-blue ring-offset-2",
        );

        if (isLinked) {
          return (
            <a
              key={card.key}
              href={`#${card.divisionSlug}`}
              aria-current={isActive ? "true" : undefined}
              style={{ backgroundColor: card.bgColor }}
              className={cardClassName}
            >
              {content}
            </a>
          );
        }

        return (
          <div key={card.key} style={{ backgroundColor: card.bgColor }} className={cardClassName}>
            {content}
          </div>
        );
      })}
    </nav>
  );
}
