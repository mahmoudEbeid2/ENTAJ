"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { saveValueProp } from "@/actions/admin/content";
import { valuePropFormSchema, type ValuePropFormValues } from "@/features/admin/content/schema";
import { storageUrl } from "@/lib/utils/asset-url";
import type { valueProps } from "@/database/schema";

type ValueProp = typeof valueProps.$inferSelect;

export function ValuePropFormDialog({ item, trigger }: { item: ValueProp; trigger: ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [homeIconFile, setHomeIconFile] = useState<File | null>(null);
  const [aboutIconFile, setAboutIconFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValuePropFormValues>({
    resolver: zodResolver(valuePropFormSchema),
    defaultValues: {
      id: item.id,
      title: item.title,
      description: item.description,
      aboutTitle: item.aboutTitle ?? "",
      aboutDescription: item.aboutDescription ?? "",
      sortOrder: item.sortOrder,
    },
  });

  const onSubmit = (values: ValuePropFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(values.id));
      formData.set("title", values.title);
      formData.set("description", values.description);
      formData.set("aboutTitle", values.aboutTitle ?? "");
      formData.set("aboutDescription", values.aboutDescription ?? "");
      formData.set("sortOrder", String(values.sortOrder));
      if (homeIconFile) formData.set("homeIcon", homeIconFile);
      if (aboutIconFile) formData.set("aboutIcon", aboutIconFile);

      const result = await saveValueProp(formData);
      if (result.success) {
        toast.success("Value prop updated.");
        setOpen(false);
        setHomeIconFile(null);
        setAboutIconFile(null);
      } else {
        toast.error(result.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Value Prop</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="vp-title">Title (Home page)</FieldLabel>
            <Input id="vp-title" aria-invalid={!!errors.title} {...register("title")} />
            <FieldError>{errors.title?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="vp-description">Description (Home page)</FieldLabel>
            <Textarea id="vp-description" rows={2} aria-invalid={!!errors.description} {...register("description")} />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="vp-about-title">Title (About page override)</FieldLabel>
            <Input id="vp-about-title" {...register("aboutTitle")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="vp-about-description">Description (About page override)</FieldLabel>
            <Textarea id="vp-about-description" rows={2} {...register("aboutDescription")} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImageUploadField
              label="Home Icon"
              defaultUrl={storageUrl(item.homeIconPath)}
              onFileChange={setHomeIconFile}
            />
            <ImageUploadField
              label="About Icon"
              defaultUrl={storageUrl(item.aboutIconPath)}
              onFileChange={setAboutIconFile}
            />
          </div>
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
