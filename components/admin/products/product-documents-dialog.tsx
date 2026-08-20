"use client";

import { useRef, useState, useTransition, type ReactElement } from "react";
import { toast } from "sonner";
import { FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { saveProductDocument, deleteProductDocument } from "@/actions/admin/product-documents";
import { formatBytes } from "@/lib/utils/format-bytes";
import { PRODUCT_DOCUMENT_LABELS } from "@/lib/constants/product-documents";
import type { ProductDocumentType } from "@/database/schema";

export interface ProductDocumentSummary {
  id: number;
  fileName: string;
  fileSizeBytes: number;
}

function DocumentSlot({
  productId,
  type,
  document,
  onChange,
}: {
  productId: number;
  type: ProductDocumentType;
  document: ProductDocumentSummary | null;
  onChange: (doc: ProductDocumentSummary | null) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", String(productId));
      formData.set("type", type);
      formData.set("file", file);

      const result = await saveProductDocument(formData);
      if (result.success) {
        toast.success(`${PRODUCT_DOCUMENT_LABELS[type]} uploaded.`);
        onChange(result.document ?? { id: document?.id ?? 0, fileName: file.name, fileSizeBytes: file.size });
      } else {
        toast.error(result.error ?? "Upload failed.");
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  const handleDelete = async () => {
    const result = await deleteProductDocument(document!.id);
    if (result.success) {
      onChange(null);
    }
    return result;
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <FileText className="size-5" />
      </span>
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium">{PRODUCT_DOCUMENT_LABELS[type]}</p>
        {document ? (
          <p className="truncate text-xs text-muted-foreground">
            {document.fileName} · {formatBytes(document.fileSizeBytes)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Not uploaded</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-3.5" />
        {isPending ? "Uploading..." : document ? "Replace" : "Upload"}
      </Button>
      {document ? (
        <ConfirmDeleteDialog
          title={`Delete ${PRODUCT_DOCUMENT_LABELS[type]}?`}
          description="This document will be removed from the product page. This action cannot be undone."
          onConfirm={handleDelete}
          trigger={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${PRODUCT_DOCUMENT_LABELS[type]}`}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          }
        />
      ) : null}
    </div>
  );
}

export function ProductDocumentsDialog({
  productId,
  productName,
  documents,
  trigger,
}: {
  productId: number;
  productName: string;
  documents: Partial<Record<ProductDocumentType, ProductDocumentSummary>>;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [msds, setMsds] = useState<ProductDocumentSummary | null>(documents.msds ?? null);
  const [coa, setCoa] = useState<ProductDocumentSummary | null>(documents.coa ?? null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Documents — {productName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <DocumentSlot productId={productId} type="msds" document={msds} onChange={setMsds} />
          <DocumentSlot productId={productId} type="coa" document={coa} onChange={setCoa} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
