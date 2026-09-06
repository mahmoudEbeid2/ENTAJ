"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type CategoryThemeContextValue = {
  color: string | null;
  setColor: (color: string | null) => void;
};

const CategoryThemeContext = createContext<CategoryThemeContextValue | null>(null);

// Lives in the shared public layout, above both SiteHeader and the page content, so a category
// detail page (a server component) can hand its category's bgColor up to the header via
// CategoryThemeSync even though the header renders before {children} as a layout sibling.
export function CategoryThemeProvider({ children }: { children: ReactNode }) {
  const [color, setColor] = useState<string | null>(null);
  return (
    <CategoryThemeContext.Provider value={{ color, setColor }}>
      {children}
    </CategoryThemeContext.Provider>
  );
}

export function useCategoryThemeColor() {
  return useContext(CategoryThemeContext)?.color ?? null;
}

/** Mount on a category page to publish its category's color for the header to pick up. Resets
 * back to null on unmount/navigation so other pages don't inherit a stale category color. */
export function CategoryThemeSync({ color }: { color: string | null | undefined }) {
  const ctx = useContext(CategoryThemeContext);
  useEffect(() => {
    ctx?.setColor(color ?? null);
    return () => ctx?.setColor(null);
  }, [ctx, color]);
  return null;
}
