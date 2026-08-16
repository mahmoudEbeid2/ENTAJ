"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admins } from "@/database/schema";
import { createSession, destroySession, getSession } from "@/lib/auth/session";
import { loginSchema } from "@/features/auth/schema";

export interface LoginActionResult {
  success: boolean;
  error?: string;
}

export async function login(
  _prevState: LoginActionResult | undefined,
  formData: FormData,
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: "Enter a valid email and password." };
  }

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.email, parsed.data.email))
    .limit(1);

  if (!admin || !admin.isActive || admin.deletedAt) {
    return { success: false, error: "Invalid email or password." };
  }

  const validPassword = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!validPassword) {
    return { success: false, error: "Invalid email or password." };
  }

  await createSession({ adminId: admin.id, email: admin.email, roleId: admin.roleId });
  await db.update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, admin.id));

  redirect("/admin/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function getCurrentAdmin() {
  const session = await getSession();
  if (!session) return null;
  const [admin] = await db.select().from(admins).where(eq(admins.id, session.adminId)).limit(1);
  if (!admin || !admin.isActive || admin.deletedAt) return null;
  return admin;
}
