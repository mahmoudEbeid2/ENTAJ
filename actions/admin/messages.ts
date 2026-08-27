"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages, activityLogs } from "@/database/schema";
import { getSession } from "@/lib/auth/session";

export interface MessageActionResult {
  success: boolean;
  error?: string;
}

export type MessageStatus = "new" | "read" | "archived";


export async function updateMessageStatus(
  id: number,
  status: MessageStatus,
): Promise<MessageActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  try {
    await db
      .update(contactMessages)
      .set({ status, readAt: status === "read" ? new Date() : undefined })
      .where(eq(contactMessages.id, id));
    await db
      .insert(activityLogs)
      .values({ adminId: session.adminId, action: `marked ${status}`, entityType: "message", entityId: id });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch {
    return { success: false, error: "Could not update this message." };
  }
}

export async function deleteMessage(id: number): Promise<MessageActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Your session has expired. Please sign in again." };
  }

  try {
    await db.update(contactMessages).set({ deletedAt: new Date() }).where(eq(contactMessages.id, id));
    await db
      .insert(activityLogs)
      .values({ adminId: session.adminId, action: "deleted", entityType: "message", entityId: id });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch {
    return { success: false, error: "Could not delete this message." };
  }
}
