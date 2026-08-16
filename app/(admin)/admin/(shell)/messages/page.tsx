import type { Metadata } from "next";
import { desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages, divisions } from "@/database/schema";
import { MessagesTable } from "@/components/admin/messages/messages-table";

export const metadata: Metadata = { title: "Messages — Entaj Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const rows = await db
    .select({ message: contactMessages, divisionName: divisions.name })
    .from(contactMessages)
    .leftJoin(divisions, eq(contactMessages.divisionId, divisions.id))
    .where(isNull(contactMessages.deletedAt))
    .orderBy(desc(contactMessages.createdAt));

  const messages = rows.map((r) => ({ ...r.message, divisionName: r.divisionName }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          {messages.length} message{messages.length === 1 ? "" : "s"} from the contact form.
        </p>
      </div>
      <MessagesTable messages={messages} />
    </div>
  );
}
