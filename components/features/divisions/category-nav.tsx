import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CategoryCardDef {
  key: string;
  label: string;
  bgColor: string;
  iconSrc: string;
  /** Slug of the real division this card should link to, if one exists. */
  divisionSlug?: string;
}

const CATEGORY_CARDS: CategoryCardDef[] = [
  {
    key: "water-treatment",
    label: "Water Treatment Chemicals",
    bgColor: "#4EC5F9",
    iconSrc: "/assets/icons/icon-category-water-treatment.svg",
    divisionSlug: "water-treatment",
  },
  {
    key: "animal-nutrition",
    label: "Animal Nutrition & Veterinary Raw Materials",
    bgColor: "#34C759",
    iconSrc: "/assets/icons/icon-category-feed-additives.png",
    divisionSlug: "animal-nutrition",
  },
  {
    key: "base-oils",
    label: "Base Oils & Petroleum Products",
    bgColor: "#F7DA8D",
    iconSrc: "/assets/icons/icon-category-base-oils.svg",
    divisionSlug: "base-oils",
  },
  {
    key: "cleaning-detergent",
    label: "Cleaning & Detergent Products",
    bgColor: "#FF6060",
    iconSrc: "/assets/icons/icon-category-industrial-laundry.svg",
    // Slug is unchanged from the pre-rename "Industrial Laundry Detergent" division —
    // only its DB name/subtitle were updated, not its slug/URL.
    divisionSlug: "industrial-laundry-detergent",
  },
  {
    key: "drilling-industrial",
    label: "Drilling & Industrial Chemicals",
    bgColor: "#BEBEBE",
    iconSrc: "/assets/icons/icon-category-glass-manufacturing.svg",
    // Slug is unchanged from the pre-rename "Glass Manufacturing Raw Materials" division.
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

  return (
    <nav
      aria-label="Product categories"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 lg:gap-6"
    >
      {CATEGORY_CARDS.map((card) => {
        const isLinked = !!card.divisionSlug && slugs.includes(card.divisionSlug);

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
        );

        if (isLinked) {
          return (
            <Link
              key={card.key}
              href={`/divisions/${card.divisionSlug}`}
              style={{ backgroundColor: card.bgColor }}
              className={cardClassName}
            >
              {content}
            </Link>
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
