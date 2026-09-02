import { z } from "zod";

export const productFormSchema = z.object({
  id: z.number().int().positive().optional(),
  divisionIds: z.array(z.number().int().positive()).min(1, "Select at least one division"),
  name: z.string().trim().min(2, "Name is required").max(255),
  recommendedLabel: z.string().trim().max(100).optional().or(z.literal("")),
  spec: z.string().trim().max(255).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  isRecommended: z.boolean(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
