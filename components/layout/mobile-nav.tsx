"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavLinks, type NavLinkItem } from "@/components/layout/nav-links";

export function MobileNav({
  items,
  logoSrc,
  siteName,
}: {
  items: NavLinkItem[];
  logoSrc: string | null;
  siteName: string;
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
            className="size-11 rounded-full bg-white/10 text-white hover:bg-white/20 active:bg-white/25 lg:hidden"
          />
        }
      >
        <Menu className="size-6" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[min(320px,85vw)] flex-col gap-0 border-l-0 bg-entaj-blue p-0 text-white"
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
          className="flex flex-1 flex-col justify-center gap-2 px-4 py-6"
          linkClassName="block rounded-xl px-3 py-3 font-expanded text-lg tracking-wide transition-colors hover:bg-white/10"
        />
      </SheetContent>
    </Sheet>
  );
}
