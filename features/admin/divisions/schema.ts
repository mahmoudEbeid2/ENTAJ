import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const divisionFormSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2, "Name is required").max(255),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(150)
    .regex(slugPattern, "Use lowercase letters, numbers, and hyphens only"),
  shortName: z.string().trim().max(100).optional().or(z.literal("")),
  subtitle: z.string().trim().max(255).optional().or(z.literal("")),
  numeral: z.string().trim().max(20).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  ctaLabel: z.string().trim().max(100).optional().or(z.literal("")),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export type DivisionFormValues = z.infer<typeof divisionFormSchema>;
