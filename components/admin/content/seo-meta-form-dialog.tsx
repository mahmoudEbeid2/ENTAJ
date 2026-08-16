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
import { saveSeoMeta } from "@/actions/admin/content";
import { seoMetaFormSchema, type SeoMetaFormValues } from "@/features/admin/content/schema";
import { storageUrl } from "@/lib/utils/asset-url";
import type { seoMeta } from "@/database/schema";

type SeoMeta = typeof seoMeta.$inferSelect;

export function SeoMetaFormDialog({ meta, trigger }: { meta: SeoMeta; trigger: ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SeoMetaFormValues>({
    resolver: zodResolver(seoMetaFormSchema),
    defaultValues: {
      id: meta.id,
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords ?? "",
    },
  });

  const onSubmit = (values: SeoMetaFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(values.id));
      formData.set("title", values.title);
      formData.set("description", values.description);
      formData.set("keywords", values.keywords ?? "");
      if (imageFile) formData.set("image", imageFile);

      const result = await saveSeoMeta(formData);
      if (result.success) {
        toast.success("SEO metadata updated.");
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
          <DialogTitle>Edit SEO Metadata</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="seo-title">Page Title</FieldLabel>
            <Input id="seo-title" aria-invalid={!!errors.title} {...register("title")} />
            <FieldError>{errors.title?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="seo-description">Meta Description</FieldLabel>
            <Textarea
              id="seo-description"
              rows={3}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="seo-keywords">Keywords</FieldLabel>
            <Input id="seo-keywords" placeholder="comma, separated, keywords" {...register("keywords")} />
          </Field>
          <ImageUploadField
            label="Social Share Image (OG Image)"
            defaultUrl={storageUrl(meta.ogImagePath)}
            onFileChange={setImageFile}
            aspect="aspect-video"
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save SEO"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
