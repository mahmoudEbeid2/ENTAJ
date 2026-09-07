import { Container } from "@/components/ui/container";

/**
 * Full-bleed title banner from Figma node 75:17/75:18 (file wg2m7NxmAMBvUlAk7DA2vB, page
 * 75:5): a solid #FFF0F0 strip, 84px tall in the Figma frame, with the category name in
 * 32px bold Saira SemiExpanded at the fixed "accents/pink" token (#FF2D55) — sampled
 * directly from the design (not a category-specific color; category.bgColor is used
 * elsewhere on the page for the blue "Product Categories" theming).
 */
export function CategoryTitleBanner({ name }: { name: string }) {
  return (
    <div className="flex min-h-[84px] w-full items-center bg-[#FFF0F0]">
      <Container>
        <h1 className="font-expanded text-[26px] font-bold text-[#FF2D55] lg:text-[32px]">{name}</h1>
      </Container>
    </div>
  );
}
