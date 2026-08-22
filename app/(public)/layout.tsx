import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ComingSoonPage } from "@/components/layout/coming-soon-page";
import { getSiteSettings } from "@/lib/data/site";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  // Maintenance mode only replaces the site in production — `next dev` always shows the
  // real site so local development isn't blocked by a flag toggled for live visitors.
  if (settings?.maintenanceMode && process.env.NODE_ENV === "production") {
    return <ComingSoonPage />;
  }

  return (
    <>
      {/* Scroll-reveal elements start hidden client-side; without JS they must stay visible. */}
      <noscript>
        <style>{`.js-reveal { opacity: 1 !important; transform: none !important; }`}</style>
      </noscript>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
