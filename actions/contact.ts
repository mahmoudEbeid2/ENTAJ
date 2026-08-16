"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages, divisions } from "@/database/schema";
import { contactFormSchema } from "@/features/contact/schema";
import { sendMail } from "@/lib/email/mailer";

export interface ContactActionResult {
  success: boolean;
  fieldErrors?: Partial<Record<keyof typeof contactFormSchema.shape, string[]>>;
  error?: string;
}

export async function submitContactMessage(
  _prevState: ContactActionResult | undefined,
  formData: FormData,
): Promise<ContactActionResult> {
  const divisionIdRaw = formData.get("divisionId");
  const raw = {
    fullName: formData.get("fullName"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    divisionId: divisionIdRaw ? Number(divisionIdRaw) : undefined,
    message: formData.get("message"),
  };

  const parsed = contactFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await db.insert(contactMessages).values({
      fullName: parsed.data.fullName,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email,
      divisionId: parsed.data.divisionId ?? null,
      message: parsed.data.message,
    });
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // Best-effort notification — the message is already saved, so an email/SMTP
  // failure here must never surface as a failed submission to the visitor.
  try {
    await notifyContactMessage(parsed.data);
  } catch (err) {
    console.error("Failed to send contact notification email:", err);
  }

  return { success: true };
}

async function notifyContactMessage(data: z.infer<typeof contactFormSchema>) {
  const notifyTo = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (!notifyTo) return;

  let divisionName: string | null = null;
  if (data.divisionId) {
    const [division] = await db
      .select({ name: divisions.name })
      .from(divisions)
      .where(eq(divisions.id, data.divisionId))
      .limit(1);
    divisionName = division?.name ?? null;
  }

  const lines = [
    `Name: ${data.fullName}`,
    data.company ? `Company: ${data.company}` : null,
    data.phone ? `Phone: ${data.phone}` : null,
    `Email: ${data.email}`,
    divisionName ? `Division of interest: ${divisionName}` : null,
    "",
    "Message:",
    data.message,
  ].filter((line): line is string => line !== null);

  await sendMail({
    to: notifyTo,
    subject: `New contact form submission from ${data.fullName}`,
    text: lines.join("\n"),
  });
}
