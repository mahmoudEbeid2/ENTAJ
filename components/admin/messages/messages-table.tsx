"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageDetailSheet,
  type MessageWithDivision,
} from "@/components/admin/messages/message-detail-sheet";

const STATUS_VARIANT: Record<MessageWithDivision["status"], "default" | "secondary" | "outline"> = {
  new: "default",
  read: "outline",
  archived: "secondary",
};

export function MessagesTable({ messages }: { messages: MessageWithDivision[] }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<MessageWithDivision | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = messages.filter((m) => statusFilter === "all" || m.status === statusFilter);

  const openMessage = (message: MessageWithDivision) => {
    setSelected(message);
    setSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="All messages">
            {(value: string | null) =>
              ({ all: "All messages", new: "New", read: "Read", archived: "Archived" })[value ?? "all"] ??
              "All messages"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All messages</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="read">Read</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm font-medium">No messages</p>
          <p className="text-sm text-muted-foreground">
            {messages.length === 0
              ? "Submissions from the contact form will show up here."
              : "No messages match this filter."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((message) => (
                <TableRow
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className="cursor-pointer"
                >
                  <TableCell className="whitespace-normal">
                    <div className="font-medium">{message.fullName}</div>
                    <div className="text-xs text-muted-foreground">{message.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {message.divisionName ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[message.status]}>{message.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <MessageDetailSheet message={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
