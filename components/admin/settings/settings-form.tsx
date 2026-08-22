"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { saveSiteSettings, saveSocialLink, saveNavItem } from "@/actions/admin/settings";
import {
  siteSettingsFormSchema,
  type SiteSettingsFormValues,
} from "@/features/admin/settings/schema";
import { storageUrl } from "@/lib/utils/asset-url";
import type { siteSettings, socialLinks, navItems } from "@/database/schema";

type SiteSettings = typeof siteSettings.$inferSelect;
type SocialLink = typeof socialLinks.$inferSelect;
type NavItem = typeof navItems.$inferSelect;

const PLATFORM_LABEL: Record<SocialLink["platform"], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};
const PLATFORMS = ["facebook", "instagram", "linkedin", "youtube"] as const;

export function SettingsForm({
  settings,
  socialLinks: existingLinks,
  headerNavItems,
  footerNavItems,
}: {
  settings: SiteSettings | null;
  socialLinks: SocialLink[];
  headerNavItems: NavItem[];
  footerNavItems: NavItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoLockupFile, setLogoLockupFile] = useState<File | null>(null);
  const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(settings?.maintenanceMode ?? false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: {
      siteName: settings?.siteName ?? "ENTAJ",
      tagline: settings?.tagline ?? "",
      footerTagline: settings?.footerTagline ?? "",
      establishedYear: settings?.establishedYear ?? "",
      parentCompany: settings?.parentCompany ?? "",
      contactEmail: settings?.contactEmail ?? "",
      contactWebsite: settings?.contactWebsite ?? "",
      contactPhone: settings?.contactPhone ?? "",
    },
  });

  const onSubmit = (values: SiteSettingsFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("siteName", values.siteName);
      formData.set("tagline", values.tagline ?? "");
      formData.set("footerTagline", values.footerTagline ?? "");
      formData.set("establishedYear", values.establishedYear ?? "");
      formData.set("parentCompany", values.parentCompany ?? "");
      formData.set("contactEmail", values.contactEmail ?? "");
      formData.set("contactWebsite", values.contactWebsite ?? "");
      formData.set("contactPhone", values.contactPhone ?? "");
      formData.set("maintenanceMode", String(maintenanceMode));
      if (logoFile) formData.set("logo", logoFile);
      if (faviconFile) formData.set("favicon", faviconFile);
      if (logoLockupFile) formData.set("logoLockup", logoLockupFile);
      if (footerLogoFile) formData.set("footerLogo", footerLogoFile);

      const result = await saveSiteSettings(formData);
      if (result.success) {
        toast.success("Settings saved.");
        setLogoFile(null);
        setFaviconFile(null);
        setLogoLockupFile(null);
        setFooterLogoFile(null);
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-start justify-between gap-4">
            <span className="flex flex-col gap-1">
              <span className="text-sm font-medium">Show &ldquo;Coming Soon&rdquo; page to visitors</span>
              <span className="text-sm text-muted-foreground">
                Replaces the entire public site with a coming-soon / maintenance page. The admin panel stays
                accessible so you can turn it back off. Only applies in production &mdash; local development
                (<code>npm run dev</code>) always shows the real site.
              </span>
            </span>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} className="mt-0.5 shrink-0" />
          </label>
          <Button
            type="button"
            size="sm"
            disabled={isPending || maintenanceMode === (settings?.maintenanceMode ?? false)}
            className="mt-4 w-fit"
            onClick={() => {
              startTransition(async () => {
                const formData = new FormData();
                formData.set("siteName", settings?.siteName ?? "ENTAJ");
                formData.set("tagline", settings?.tagline ?? "");
                formData.set("footerTagline", settings?.footerTagline ?? "");
                formData.set("establishedYear", settings?.establishedYear ?? "");
                formData.set("parentCompany", settings?.parentCompany ?? "");
                formData.set("contactEmail", settings?.contactEmail ?? "");
                formData.set("contactWebsite", settings?.contactWebsite ?? "");
                formData.set("contactPhone", settings?.contactPhone ?? "");
                formData.set("maintenanceMode", String(maintenanceMode));
                const result = await saveSiteSettings(formData);
                if (result.success) toast.success("Maintenance mode updated.");
                else toast.error(result.error ?? "Something went wrong.");
              });
            }}
          >
            {isPending ? "Saving..." : "Save Maintenance Mode"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ImageUploadField label="Logo" defaultUrl={storageUrl(settings?.logoPath)} onFileChange={setLogoFile} />
              <ImageUploadField
                label="Favicon"
                defaultUrl={storageUrl(settings?.faviconPath)}
                onFileChange={setFaviconFile}
              />
              <ImageUploadField
                label="Logo Lockup (with tagline)"
                defaultUrl={storageUrl(settings?.logoLockupPath)}
                onFileChange={setLogoLockupFile}
              />
              <ImageUploadField
                label="Footer Logo"
                defaultUrl={storageUrl(settings?.footerLogoPath)}
                onFileChange={setFooterLogoFile}
              />
            </div>

            <Field>
              <FieldLabel htmlFor="settings-site-name">Site Name</FieldLabel>
              <Input id="settings-site-name" aria-invalid={!!errors.siteName} {...register("siteName")} />
              <FieldError>{errors.siteName?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-tagline">Tagline</FieldLabel>
              <Input id="settings-tagline" {...register("tagline")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-footer-tagline">Footer Tagline</FieldLabel>
              <Textarea id="settings-footer-tagline" rows={2} {...register("footerTagline")} />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="settings-established-year">Established Year</FieldLabel>
                <Input id="settings-established-year" placeholder="2012" {...register("establishedYear")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="settings-parent-company">Parent Company</FieldLabel>
                <Input id="settings-parent-company" placeholder="HS Group Ltd" {...register("parentCompany")} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="settings-contact-email">Contact Email</FieldLabel>
                <Input
                  id="settings-contact-email"
                  type="email"
                  aria-invalid={!!errors.contactEmail}
                  {...register("contactEmail")}
                />
                <FieldError>{errors.contactEmail?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="settings-contact-website">Website</FieldLabel>
                <Input id="settings-contact-website" {...register("contactWebsite")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="settings-contact-phone">Phone</FieldLabel>
                <Input id="settings-contact-phone" {...register("contactPhone")} />
              </Field>
            </div>

            <Button type="submit" disabled={isPending} className="w-fit">
              {isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SocialLinksCard existingLinks={existingLinks} />
      <NavItemsCard title="Header Navigation" items={headerNavItems} />
      <NavItemsCard title="Footer Navigation" items={footerNavItems} />
    </div>
  );
}

function SocialLinksCard({ existingLinks }: { existingLinks: SocialLink[] }) {
  const [isPending, startTransition] = useTransition();
  const linkByPlatform = new Map(existingLinks.map((l) => [l.platform, l]));
  const [values, setValues] = useState(
    () =>
      new Map(
        PLATFORMS.map((platform) => [
          platform,
          {
            url: linkByPlatform.get(platform)?.url ?? "",
            isActive: linkByPlatform.get(platform)?.isActive ?? true,
          },
        ]),
      ),
  );

  const update = (platform: (typeof PLATFORMS)[number], patch: Partial<{ url: string; isActive: boolean }>) => {
    setValues((prev) => {
      const next = new Map(prev);
      next.set(platform, { ...next.get(platform)!, ...patch });
      return next;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const results = await Promise.all(
        PLATFORMS.map((platform) => {
          const v = values.get(platform)!;
          const formData = new FormData();
          formData.set("platform", platform);
          formData.set("url", v.url || "#");
          formData.set("isActive", String(v.isActive));
          return saveSocialLink(formData);
        }),
      );
      if (results.every((r) => r.success)) {
        toast.success("Social links saved.");
      } else {
        toast.error("Some social links could not be saved.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {PLATFORMS.map((platform) => {
          const v = values.get(platform)!;
          return (
            <div key={platform} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="w-24 shrink-0 text-sm font-medium">{PLATFORM_LABEL[platform]}</span>
              <Input
                value={v.url}
                onChange={(e) => update(platform, { url: e.target.value })}
                placeholder="https://..."
                className="flex-1"
              />
              <label className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                Active
                <Switch
                  checked={v.isActive}
                  onCheckedChange={(checked) => update(platform, { isActive: checked })}
                />
              </label>
            </div>
          );
        })}
        <Button onClick={handleSave} disabled={isPending} className="w-fit">
          {isPending ? "Saving..." : "Save Social Links"}
        </Button>
      </CardContent>
    </Card>
  );
}

function NavItemsCard({ title, items }: { title: string; items: NavItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(
    () => new Map(items.map((item) => [item.id, { label: item.label, href: item.href, isActive: item.isActive }])),
  );

  if (items.length === 0) return null;

  const update = (id: number, patch: Partial<{ label: string; href: string; isActive: boolean }>) => {
    setValues((prev) => {
      const next = new Map(prev);
      next.set(id, { ...next.get(id)!, ...patch });
      return next;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const results = await Promise.all(
        items.map((item) => {
          const v = values.get(item.id)!;
          const formData = new FormData();
          formData.set("id", String(item.id));
          formData.set("label", v.label);
          formData.set("href", v.href);
          formData.set("isActive", String(v.isActive));
          return saveNavItem(formData);
        }),
      );
      if (results.every((r) => r.success)) {
        toast.success(`${title} saved.`);
      } else {
        toast.error("Some nav items could not be saved.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.map((item) => {
          const v = values.get(item.id)!;
          return (
            <div key={item.id} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={v.label}
                onChange={(e) => update(item.id, { label: e.target.value })}
                placeholder="Label"
                className="sm:w-40"
              />
              <Input
                value={v.href}
                onChange={(e) => update(item.id, { href: e.target.value })}
                placeholder="/path"
                className="flex-1"
              />
              <label className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                Active
                <Switch
                  checked={v.isActive}
                  onCheckedChange={(checked) => update(item.id, { isActive: checked })}
                />
              </label>
            </div>
          );
        })}
        <Button onClick={handleSave} disabled={isPending} className="w-fit">
          {isPending ? "Saving..." : `Save ${title}`}
        </Button>
      </CardContent>
    </Card>
  );
}
