"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { saveOffice } from "@/actions/admin/content";
import { officeFormSchema, type OfficeFormValues } from "@/features/admin/content/schema";
import { storageUrl } from "@/lib/utils/asset-url";
import type { offices } from "@/database/schema";

type Office = typeof offices.$inferSelect;

export function OfficeFormDialog({ office, trigger }: { office: Office; trigger: ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [flagFile, setFlagFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OfficeFormValues>({
    resolver: zodResolver(officeFormSchema),
    defaultValues: {
      id: office.id,
      label: office.label,
      address: office.address,
      isPrimary: office.isPrimary,
      sortOrder: office.sortOrder,
    },
  });

  const onSubmit = (values: OfficeFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(values.id));
      formData.set("label", values.label);
      formData.set("address", values.address);
      formData.set("isPrimary", String(values.isPrimary));
      formData.set("sortOrder", String(values.sortOrder));
      if (flagFile) formData.set("flag", flagFile);

      const result = await saveOffice(formData);
      if (result.success) {
        toast.success("Office updated.");
        setOpen(false);
        setFlagFile(null);
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Office</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="office-label">Label</FieldLabel>
            <Input id="office-label" placeholder="Amman, Jordan" aria-invalid={!!errors.label} {...register("label")} />
            <FieldError>{errors.label?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="office-address">Address</FieldLabel>
            <Input id="office-address" aria-invalid={!!errors.address} {...register("address")} />
            <FieldError>{errors.address?.message}</FieldError>
          </Field>
          <ImageUploadField label="Flag Icon" defaultUrl={storageUrl(office.flagIconPath)} onFileChange={setFlagFile} />
          <Controller
            control={control}
            name="isPrimary"
            render={({ field }) => (
              <label className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                Primary office
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
