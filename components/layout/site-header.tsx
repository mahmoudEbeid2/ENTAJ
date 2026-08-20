import { getNavItems, getSiteSettings } from "@/lib/data/site";
import { storageUrl } from "@/lib/utils/asset-url";
import { SiteHeaderShell } from "@/components/layout/site-header-shell";

export async function SiteHeader() {
  const [navItems, settings] = await Promise.all([getNavItems("header"), getSiteSettings()]);
  const logoSrc = storageUrl(settings?.logoPath);
  const siteName = settings?.siteName ?? "ENTAJ";

  const items = navItems.map((item) => ({ id: item.id, label: item.label, href: item.href }));

  return <SiteHeaderShell items={items} logoSrc={logoSrc} siteName={siteName} />;
}
