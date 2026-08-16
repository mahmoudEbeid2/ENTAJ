"use client";

import { useEffect, useTransition } from "react";
import { Archive, Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { updateMessageStatus, deleteMessage } from "@/actions/admin/messages";
import type { contactMessages } from "@/database/schema";

export type MessageWithDivision = typeof contactMessages.$inferSelect & {
  divisionName: string | null;
};

const STATUS_LABEL: Record<MessageWithDivision["status"], string> = {
  new: "New",
  read: "Read",
  archived: "Archived",
};

export function MessageDetailSheet({
  message,
  open,
  onOpenChange,
}: {
  message: MessageWithDivision | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && message && message.status === "new") {
      startTransition(async () => {
        await updateMessageStatus(message.id, "read");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-check when a different message opens
  }, [open, message?.id]);

  const setStatus = (status: "read" | "archived" | "new") => {
    if (!message) return;
    startTransition(async () => {
      const result = await updateMessageStatus(message.id, status);
      if (!result.success) toast.error(result.error ?? "Something went wrong.");
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 data-[side=right]:sm:max-w-md">
        {message ? (
          <>
            <SheetHeader className="border-b">
              <SheetTitle>{message.fullName}</SheetTitle>
              <Badge variant="outline" className="w-fit">
                {STATUS_LABEL[message.status]}
              </Badge>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4">
              <dl className="flex flex-col gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{message.email}</dd>
                </div>
                {message.company ? (
                  <div>
                    <dt className="text-muted-foreground">Company</dt>
                    <dd className="font-medium">{message.company}</dd>
                  </div>
                ) : null}
                {message.phone ? (
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="font-medium">{message.phone}</dd>
                  </div>
                ) : null}
                {message.divisionName ? (
                  <div>
                    <dt className="text-muted-foreground">Division of interest</dt>
                    <dd className="font-medium">{message.divisionName}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-muted-foreground">Received</dt>
                  <dd className="font-medium">{new Date(message.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-muted-foreground">Message</dt>
                  <dd className="rounded-lg bg-muted p-3 whitespace-pre-wrap">{message.message}</dd>
                </div>
              </dl>
            </div>

            <SheetFooter className="flex-row flex-wrap gap-2 border-t">
              {message.status !== "archived" ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setStatus("archived")}
                >
                  <Archive className="size-4" />
                  Archive
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setStatus("read")}
                >
                  <MailOpen className="size-4" />
                  Unarchive
                </Button>
              )}
              {message.status === "read" ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setStatus("new")}
                >
                  <Mail className="size-4" />
                  Mark as new
                </Button>
              ) : null}
              <ConfirmDeleteDialog
                title="Delete this message?"
                description="This message will be permanently removed from the inbox."
                onConfirm={async () => {
                  const result = await deleteMessage(message.id);
                  if (result.success) onOpenChange(false);
                  return result;
                }}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                }
              />
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
