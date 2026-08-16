"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/lib/admin/nav-config";
import { cn } from "@/lib/utils";

export function AdminNavList({
  unreadMessages = 0,
  onNavigate,
}: {
  unreadMessages?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isActive && "bg-entaj-blue text-white hover:bg-entaj-blue hover:text-white",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.href === "/admin/messages" && unreadMessages > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                {unreadMessages}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
