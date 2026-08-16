import { z } from "zod";

export const siteSettingsFormSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required").max(150),
  tagline: z.string().trim().max(255).optional().or(z.literal("")),
  footerTagline: z.string().trim().max(500).optional().or(z.literal("")),
  establishedYear: z.string().trim().max(10).optional().or(z.literal("")),
  parentCompany: z.string().trim().max(150).optional().or(z.literal("")),
  contactEmail: z.email("Enter a valid email").trim().max(255).optional().or(z.literal("")),
  contactWebsite: z.string().trim().max(255).optional().or(z.literal("")),
  contactPhone: z.string().trim().max(50).optional().or(z.literal("")),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;

export const socialLinkFormSchema = z.object({
  platform: z.enum(["facebook", "instagram", "linkedin", "youtube"]),
  url: z.string().trim().min(1, "URL is required").max(500),
  isActive: z.boolean().default(true),
});

export type SocialLinkFormValues = z.infer<typeof socialLinkFormSchema>;

export const navItemFormSchema = z.object({
  id: z.number().int().positive(),
  label: z.string().trim().min(1, "Label is required").max(100),
  href: z.string().trim().min(1, "Link is required").max(255),
  isActive: z.boolean(),
});

export type NavItemFormValues = z.infer<typeof navItemFormSchema>;
