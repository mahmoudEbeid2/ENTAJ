import "server-only";
import nodemailer from "nodemailer";

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD.",
    );
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}

export async function sendMail({ to, subject, text, html }: SendMailOptions): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM is not configured.");
  }
  const transporter = getTransporter();
  await transporter.sendMail({ from, to, subject, text, html });
}
