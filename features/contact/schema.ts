import { z } from "zod";

export const contactFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(150),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  email: z.email("Enter a valid email address").trim().max(255),
  divisionId: z.number().int().positive().optional(),
  message: z.string().trim().min(10, "Please describe what you're looking for").max(3000),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
