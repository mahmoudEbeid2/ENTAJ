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
import { saveHeroSlide } from "@/actions/admin/content";
import {
  heroSlideFormSchema,
  type HeroSlideFormValues,
} from "@/features/admin/content/schema";
import { storageUrl } from "@/lib/utils/asset-url";
import type { heroSlides } from "@/database/schema";
import type { PageSlug } from "@/database/schema";

type HeroSlide = typeof heroSlides.$inferSelect;

export function HeroSlideFormDialog({
  page,
  slide,
  trigger,
}: {
  page: PageSlug;
  slide?: HeroSlide;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<HeroSlideFormValues>({
    resolver: zodResolver(heroSlideFormSchema),
    defaultValues: slide
      ? {
          id: slide.id,
          page,
          title: slide.title,
          subtitle: slide.subtitle ?? "",
          ctaPrimaryLabel: slide.ctaPrimaryLabel ?? "",
          ctaPrimaryHref: slide.ctaPrimaryHref ?? "",
          ctaSecondaryLabel: slide.ctaSecondaryLabel ?? "",
          ctaSecondaryHref: slide.ctaSecondaryHref ?? "",
          sortOrder: slide.sortOrder,
          isActive: slide.isActive,
        }
      : { page, sortOrder: 0, isActive: true },
  });

  const onSubmit = (values: HeroSlideFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      if (values.id) formData.set("id", String(values.id));
      formData.set("page", values.page);
      formData.set("title", values.title);
      formData.set("subtitle", values.subtitle ?? "");
      formData.set("ctaPrimaryLabel", values.ctaPrimaryLabel ?? "");
      formData.set("ctaPrimaryHref", values.ctaPrimaryHref ?? "");
      formData.set("ctaSecondaryLabel", values.ctaSecondaryLabel ?? "");
      formData.set("ctaSecondaryHref", values.ctaSecondaryHref ?? "");
      formData.set("sortOrder", String(values.sortOrder));
      formData.set("isActive", String(values.isActive));
      if (imageFile) formData.set("image", imageFile);

      const result = await saveHeroSlide(formData);
      if (result.success) {
        toast.success(slide ? "Hero slide updated." : "Hero slide created.");
        setOpen(false);
        setImageFile(null);
        if (!slide) reset();
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
          <DialogTitle>{slide ? "Edit Hero Slide" : "Add Hero Slide"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="slide-title">Title</FieldLabel>
            <Input id="slide-title" aria-invalid={!!errors.title} {...register("title")} />
            <FieldError>{errors.title?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="slide-subtitle">Subtitle</FieldLabel>
            <Textarea id="slide-subtitle" rows={2} {...register("subtitle")} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="slide-cta1-label">Primary CTA Label</FieldLabel>
              <Input id="slide-cta1-label" {...register("ctaPrimaryLabel")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="slide-cta1-href">Primary CTA Link</FieldLabel>
              <Input id="slide-cta1-href" {...register("ctaPrimaryHref")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="slide-cta2-label">Secondary CTA Label</FieldLabel>
              <Input id="slide-cta2-label" {...register("ctaSecondaryLabel")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="slide-cta2-href">Secondary CTA Link</FieldLabel>
              <Input id="slide-cta2-href" {...register("ctaSecondaryHref")} />
            </Field>
          </div>

          <ImageUploadField
            label="Background Image"
            defaultUrl={slide?.imagePath ? storageUrl(slide.imagePath) : null}
            onFileChange={setImageFile}
            aspect="aspect-video"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="slide-sort-order">Sort Order</FieldLabel>
              <Input
                id="slide-sort-order"
                type="number"
                {...register("sortOrder", { valueAsNumber: true })}
              />
            </Field>
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
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Slide"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
