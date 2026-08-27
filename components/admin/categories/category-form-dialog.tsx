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
import { saveCategory } from "@/actions/admin/categories";
import { categoryFormSchema, type CategoryFormValues } from "@/features/admin/categories/schema";
import { storageUrl } from "@/lib/utils/asset-url";
import type { categories } from "@/database/schema";



type Category = typeof categories.$inferSelect;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CategoryFormDialog({
  category,
  trigger,
}: {
  category?: Category;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [slugEdited, setSlugEdited] = useState(!!category);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: category
      ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
          shortName: category.shortName ?? "",
          description: category.description ?? "",
          bgColor: category.bgColor ?? "",
          isActive: category.isActive,
          sortOrder: category.sortOrder,
        }
      : { isActive: true, sortOrder: 0 },
  });

  const onSubmit = (values: CategoryFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      if (values.id) formData.set("id", String(values.id));
      formData.set("name", values.name);
      formData.set("slug", values.slug);
      formData.set("shortName", values.shortName ?? "");
      formData.set("description", values.description ?? "");
      formData.set("bgColor", values.bgColor ?? "");
      formData.set("isActive", String(values.isActive));
      formData.set("sortOrder", String(values.sortOrder));
      if (iconFile) formData.set("icon", iconFile);

      const result = await saveCategory(formData);
      if (result.success) {
        toast.success(category ? "Category updated." : "Category created.");
        setOpen(false);
        setIconFile(null);
        if (!category) {
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
          <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="category-name">Name</FieldLabel>
            <Input
              id="category-name"
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
            <FieldLabel htmlFor="category-slug">Slug</FieldLabel>
            <Input
              id="category-slug"
              aria-invalid={!!errors.slug}
              {...register("slug", { onChange: () => setSlugEdited(true) })}
            />
            <FieldError>{errors.slug?.message}</FieldError>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="category-short-name">Short Name</FieldLabel>
              <Input id="category-short-name" {...register("shortName")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="category-bg-color">Card Color (Hex)</FieldLabel>
              <Input id="category-bg-color" placeholder="#34C759" {...register("bgColor")} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="category-description">Description</FieldLabel>
            <Textarea id="category-description" rows={3} {...register("description")} />
          </Field>

          <ImageUploadField
            label="Category Icon"
            defaultUrl={category?.iconPath ? (category.iconPath.startsWith("/") ? category.iconPath : storageUrl(category.iconPath)) : null}
            onFileChange={setIconFile}
            aspect="aspect-square"
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
              {isPending ? "Saving..." : "Save Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
