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
import { saveDivision } from "@/actions/admin/divisions";
import { divisionFormSchema, type DivisionFormValues } from "@/features/admin/divisions/schema";
import { storageUrl } from "@/lib/utils/asset-url";
import type { divisions } from "@/database/schema";

type Division = typeof divisions.$inferSelect;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function DivisionFormDialog({
  division,
  trigger,
}: {
  division?: Division;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [slugEdited, setSlugEdited] = useState(!!division);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DivisionFormValues>({
    resolver: zodResolver(divisionFormSchema),
    defaultValues: division
      ? {
          id: division.id,
          name: division.name,
          slug: division.slug,
          shortName: division.shortName ?? "",
          subtitle: division.subtitle ?? "",
          numeral: division.numeral ?? "",
          description: division.description ?? "",
          ctaLabel: division.ctaLabel ?? "",
          isActive: division.isActive,
          sortOrder: division.sortOrder,
        }
      : { isActive: true, sortOrder: 0 },
  });

  const onSubmit = (values: DivisionFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      if (values.id) formData.set("id", String(values.id));
      formData.set("name", values.name);
      formData.set("slug", values.slug);
      formData.set("shortName", values.shortName ?? "");
      formData.set("subtitle", values.subtitle ?? "");
      formData.set("numeral", values.numeral ?? "");
      formData.set("description", values.description ?? "");
      formData.set("ctaLabel", values.ctaLabel ?? "");
      formData.set("isActive", String(values.isActive));
      formData.set("sortOrder", String(values.sortOrder));
      if (imageFile) formData.set("image", imageFile);

      const result = await saveDivision(formData);
      if (result.success) {
        toast.success(division ? "Division updated." : "Division created.");
        setOpen(false);
        setImageFile(null);
        if (!division) {
          reset();
          setSlugEdited(false);
        }
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
          <DialogTitle>{division ? "Edit Division" : "Add Division"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="division-name">Name</FieldLabel>
            <Input
              id="division-name"
              aria-invalid={!!errors.name}
              {...register("name", {
                onChange: (e) => {
                  if (!slugEdited) setValue("slug", slugify(e.target.value));
                },
              })}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="division-slug">Slug</FieldLabel>
            <Input
              id="division-slug"
              aria-invalid={!!errors.slug}
              {...register("slug", { onChange: () => setSlugEdited(true) })}
            />
            <FieldError>{errors.slug?.message}</FieldError>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="division-short-name">Short Name</FieldLabel>
              <Input id="division-short-name" {...register("shortName")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="division-numeral">Numeral</FieldLabel>
              <Input id="division-numeral" placeholder="e.g. 01" {...register("numeral")} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="division-subtitle">Subtitle</FieldLabel>
            <Input id="division-subtitle" {...register("subtitle")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="division-description">Description</FieldLabel>
            <Textarea id="division-description" rows={3} {...register("description")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="division-cta-label">CTA Button Label</FieldLabel>
            <Input id="division-cta-label" placeholder="GO TO PRODUCTS" {...register("ctaLabel")} />
          </Field>

          <ImageUploadField
            label="Division Banner"
            defaultUrl={division?.imagePath ? storageUrl(division.imagePath) : null}
            onFileChange={setImageFile}
            aspect="aspect-video"
          />

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
              {isPending ? "Saving..." : "Save Division"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
