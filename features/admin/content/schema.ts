import { z } from "zod";
import { PAGE_SLUGS } from "@/database/schema";

export const heroSlideFormSchema = z.object({
  id: z.number().int().positive().optional(),
  page: z.enum(PAGE_SLUGS),
  title: z.string().trim().min(1, "Title is required").max(255),
  subtitle: z.string().trim().max(500).optional().or(z.literal("")),
  ctaPrimaryLabel: z.string().trim().max(100).optional().or(z.literal("")),
  ctaPrimaryHref: z.string().trim().max(255).optional().or(z.literal("")),
  ctaSecondaryLabel: z.string().trim().max(100).optional().or(z.literal("")),
  ctaSecondaryHref: z.string().trim().max(255).optional().or(z.literal("")),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export type HeroSlideFormValues = z.infer<typeof heroSlideFormSchema>;

export const pageSectionFormSchema = z.object({
  id: z.number().int().positive(),
  eyebrow: z.string().trim().max(150).optional().or(z.literal("")),
  heading: z.string().trim().max(500).optional().or(z.literal("")),
  subheading: z.string().trim().max(500).optional().or(z.literal("")),
  body: z.string().trim().max(3000).optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type PageSectionFormValues = z.infer<typeof pageSectionFormSchema>;

export const seoMetaFormSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().min(1, "Description is required").max(500),
  keywords: z.string().trim().max(500).optional().or(z.literal("")),
});

export type SeoMetaFormValues = z.infer<typeof seoMetaFormSchema>;

export const statFormSchema = z.object({
  id: z.number().int().positive(),
  value: z.string().trim().min(1, "Value is required").max(50),
  label: z.string().trim().min(1, "Label is required").max(150),
  sortOrder: z.number().int(),
});

export type StatFormValues = z.infer<typeof statFormSchema>;

export const valuePropFormSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().min(1, "Description is required").max(1000),
  aboutTitle: z.string().trim().max(255).optional().or(z.literal("")),
  aboutDescription: z.string().trim().max(1000).optional().or(z.literal("")),
  sortOrder: z.number().int(),
});

export type ValuePropFormValues = z.infer<typeof valuePropFormSchema>;

export const whyUsFeatureFormSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().min(1, "Description is required").max(1000),
  sortOrder: z.number().int(),
});

export type WhyUsFeatureFormValues = z.infer<typeof whyUsFeatureFormSchema>;

export const marketRegionFormSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1, "Name is required").max(150),
  countries: z.string().trim().min(1, "Countries is required").max(500),
  sortOrder: z.number().int(),
});

export type MarketRegionFormValues = z.infer<typeof marketRegionFormSchema>;

export const ctaPanelFormSchema = z.object({
  id: z.number().int().positive(),
  heading: z.string().trim().min(1, "Heading is required").max(255),
  subheading: z.string().trim().max(255).optional().or(z.literal("")),
  body: z.string().trim().min(1, "Body is required").max(2000),
  buttonLabel: z.string().trim().max(100).optional().or(z.literal("")),
  buttonHref: z.string().trim().max(255).optional().or(z.literal("")),
});

export type CtaPanelFormValues = z.infer<typeof ctaPanelFormSchema>;

export const officeFormSchema = z.object({
  id: z.number().int().positive(),
  label: z.string().trim().min(1, "Label is required").max(150),
  address: z.string().trim().min(1, "Address is required").max(500),
  isPrimary: z.boolean(),
  sortOrder: z.number().int(),
});

export type OfficeFormValues = z.infer<typeof officeFormSchema>;
