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
import { saveWhyUsFeature } from "@/actions/admin/content";
import { whyUsFeatureFormSchema, type WhyUsFeatureFormValues } from "@/features/admin/content/schema";
import { storageUrl } from "@/lib/utils/asset-url";
import type { whyUsFeatures } from "@/database/schema";

type WhyUsFeature = typeof whyUsFeatures.$inferSelect;

export function WhyUsFeatureFormDialog({
  feature,
  trigger,
}: {
  feature: WhyUsFeature;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WhyUsFeatureFormValues>({
    resolver: zodResolver(whyUsFeatureFormSchema),
    defaultValues: {
      id: feature.id,
      title: feature.title,
      description: feature.description,
      sortOrder: feature.sortOrder,
    },
  });

  const onSubmit = (values: WhyUsFeatureFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(values.id));
      formData.set("title", values.title);
      formData.set("description", values.description);
      formData.set("sortOrder", String(values.sortOrder));
      if (imageFile) formData.set("image", imageFile);

      const result = await saveWhyUsFeature(formData);
      if (result.success) {
        toast.success("Feature updated.");
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
          <DialogTitle>Edit Feature #{feature.number}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="wf-title">Title</FieldLabel>
            <Input id="wf-title" aria-invalid={!!errors.title} {...register("title")} />
            <FieldError>{errors.title?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="wf-description">Description</FieldLabel>
            <Textarea id="wf-description" rows={3} aria-invalid={!!errors.description} {...register("description")} />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>
          <ImageUploadField label="Icon" defaultUrl={storageUrl(feature.imagePath)} onFileChange={setImageFile} />
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
