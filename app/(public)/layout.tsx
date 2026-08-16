import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
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
