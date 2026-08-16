import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings, socialLinks, navItems } from "@/database/schema";
import { SettingsForm } from "@/components/admin/settings/settings-form";

export const metadata: Metadata = { title: "Settings — Entaj Admin" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [[settings], links, headerNavItems, footerNavItems] = await Promise.all([
    db.select().from(siteSettings).limit(1),
    db.select().from(socialLinks),
    db.select().from(navItems).where(eq(navItems.menuKey, "header")),
    db.select().from(navItems).where(eq(navItems.menuKey, "footer")),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Site-wide branding and contact details.</p>
      </div>
      <SettingsForm
        settings={settings ?? null}
        socialLinks={links}
        headerNavItems={headerNavItems}
        footerNavItems={footerNavItems}
      />
    </div>
  );
}
