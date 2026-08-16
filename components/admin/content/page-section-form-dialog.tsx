"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { savePageSection } from "@/actions/admin/content";
import {
  pageSectionFormSchema,
  type PageSectionFormValues,
} from "@/features/admin/content/schema";
import { storageUrl } from "@/lib/utils/asset-url";
import type { pageSections } from "@/database/schema";

type PageSection = typeof pageSections.$inferSelect;

export function PageSectionFormDialog({
  section,
  trigger,
}: {
  section: PageSection;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PageSectionFormValues>({
    resolver: zodResolver(pageSectionFormSchema),
    defaultValues: {
      id: section.id,
      eyebrow: section.eyebrow ?? "",
      heading: section.heading ?? "",
      subheading: section.subheading ?? "",
      body: section.body ?? "",
      isActive: section.isActive,
    },
  });

  const onSubmit = (values: PageSectionFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(values.id));
      formData.set("eyebrow", values.eyebrow ?? "");
      formData.set("heading", values.heading ?? "");
      formData.set("subheading", values.subheading ?? "");
      formData.set("body", values.body ?? "");
      formData.set("isActive", String(values.isActive));
      if (imageFile) formData.set("image", imageFile);

      const result = await savePageSection(formData);
      if (result.success) {
        toast.success("Section updated.");
        setOpen(false);
        setImageFile(null);
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
          <DialogTitle>Edit Section — {section.sectionKey}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="section-eyebrow">Eyebrow</FieldLabel>
            <Input id="section-eyebrow" {...register("eyebrow")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="section-heading">Heading</FieldLabel>
            <Input id="section-heading" aria-invalid={!!errors.heading} {...register("heading")} />
            <FieldError>{errors.heading?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="section-subheading">Subheading</FieldLabel>
            <Input id="section-subheading" {...register("subheading")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="section-body">Body</FieldLabel>
            <Textarea id="section-body" rows={4} {...register("body")} />
          </Field>

          {section.imagePath !== null ? (
            <ImageUploadField
              label="Image"
              defaultUrl={storageUrl(section.imagePath)}
              onFileChange={setImageFile}
              aspect="aspect-video"
            />
          ) : null}

          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <label className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                Active
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
