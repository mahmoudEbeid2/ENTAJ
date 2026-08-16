"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AdminNavList } from "@/components/admin/admin-nav-list";
import { logout } from "@/actions/auth";

export function AdminShell({
  adminName,
  unreadMessages,
  children,
}: {
  adminName: string;
  unreadMessages: number;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
          <Link
            href="/admin/dashboard"
            className="text-gradient-entaj font-expanded text-xl font-bold uppercase"
          >
            Entaj Admin
          </Link>
        </div>
        <AdminNavList unreadMessages={unreadMessages} />
        <div className="border-t border-sidebar-border p-3">
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/70"
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0">
          <SheetHeader className="h-16 shrink-0 flex-row items-center border-b border-sidebar-border px-5">
            <SheetTitle className="text-gradient-entaj font-expanded text-xl font-bold uppercase">
              Entaj Admin
            </SheetTitle>
          </SheetHeader>
          <AdminNavList unreadMessages={unreadMessages} onNavigate={() => setMobileOpen(false)} />
          <div className="border-t border-sidebar-border p-3">
            <form action={logout}>
              <Button type="submit" variant="ghost" className="w-full justify-start gap-3">
                <LogOut className="size-4" />
                Logout
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex-1" />
          <span className="truncate text-sm text-muted-foreground">{adminName}</span>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
