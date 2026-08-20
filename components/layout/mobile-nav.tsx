"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavLinks, type NavLinkItem } from "@/components/layout/nav-links";
import { cn } from "@/lib/utils";

export function MobileNav({
  items,
  logoSrc,
  siteName,
  strong = false,
}: {
  items: NavLinkItem[];
  logoSrc: string | null;
  siteName: string;
  /** Slightly more deliberate trigger treatment for the solid internal-page header, where the
   * backdrop is a flat brand color rather than a variable photo. */
  strong?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation menu"
            className={cn(
              "size-11 rounded-full text-white lg:hidden",
              strong
                ? "bg-white/15 hover:bg-white/25 active:bg-white/30"
                : "bg-white/10 hover:bg-white/20 active:bg-white/25",
            )}
          />
        }
      >
        <Menu className="size-6" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[min(320px,85vw)] flex-col gap-0 border-l-0 bg-gradient-entaj p-0 text-white shadow-2xl"
      >
        <SheetHeader className="shrink-0 border-b border-white/15 px-6 py-6">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          {logoSrc ? (
            <Image src={logoSrc} alt={siteName} width={140} height={46} className="h-9 w-auto" />
          ) : (
            <span className="font-expanded text-xl">{siteName}</span>
          )}
        </SheetHeader>
        <NavLinks
          items={items}
          onNavigate={() => setOpen(false)}
          className="flex flex-1 flex-col justify-center gap-1.5 px-4 py-6"
          linkClassName="block rounded-xl px-4 py-3.5 font-expanded text-lg tracking-wide transition-all duration-150 hover:translate-x-1 hover:bg-white/10"
        />
      </SheetContent>
    </Sheet>
  );
}
