import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages } from "@/database/schema";
import { getCurrentAdmin } from "@/actions/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminShellLayout({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const unread = await db
    .select({ id: contactMessages.id })
    .from(contactMessages)
    .where(and(eq(contactMessages.status, "new"), isNull(contactMessages.deletedAt)));

  return (
    <AdminShell adminName={admin.name} unreadMessages={unread.length}>
      {children}
    </AdminShell>
  );
}
