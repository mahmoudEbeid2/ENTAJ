"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavLinkItem {
  id: number;
  label: string;
  href: string;
}

export function NavLinks({
  items,
  className,
  linkClassName,
  onNavigate,
}: {
  items: NavLinkItem[];
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <ul className={className}>
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                linkClassName,
                "transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current",
                isActive && "opacity-100 underline underline-offset-8",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
