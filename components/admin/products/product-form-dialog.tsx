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
import { saveProduct } from "@/actions/admin/products";
import { productFormSchema, type ProductFormValues } from "@/features/admin/products/schema";
import { storageUrl } from "@/lib/utils/asset-url";
import type { products } from "@/database/schema";

type Product = typeof products.$inferSelect;

export function ProductFormDialog({
  divisions,
  product,
  divisionIds: currentDivisionIds,
  trigger,
}: {
  divisions: { id: number; name: string }[];
  product?: Product;
  /** The product's current division memberships (from product_divisions). Ignored when adding a new product. */
  divisionIds?: number[];
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
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          id: product.id,
          divisionIds: currentDivisionIds ?? [product.divisionId],
          name: product.name,
          recommendedLabel: product.recommendedLabel ?? "",
          spec: product.spec ?? "",
          description: product.description ?? "",
          isRecommended: product.isRecommended,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          sortOrder: product.sortOrder,
        }
      : { isActive: true, isRecommended: false, isFeatured: false, sortOrder: 0 },
  });

  const onSubmit = (values: ProductFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      if (values.id) formData.set("id", String(values.id));
      formData.set("divisionIds", JSON.stringify(values.divisionIds));
      formData.set("name", values.name);
      formData.set("recommendedLabel", values.recommendedLabel ?? "");
      formData.set("spec", values.spec ?? "");
      formData.set("description", values.description ?? "");
      formData.set("isRecommended", String(values.isRecommended));
      formData.set("isFeatured", String(values.isFeatured));
      formData.set("isActive", String(values.isActive));
      formData.set("sortOrder", String(values.sortOrder));
      if (imageFile) formData.set("image", imageFile);

      const result = await saveProduct(formData);
      if (result.success) {
        toast.success(product ? "Product updated." : "Product created.");
        setOpen(false);
        setImageFile(null);
        if (!product) reset();
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
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="product-name">Name</FieldLabel>
            <Input id="product-name" aria-invalid={!!errors.name} {...register("name")} />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Divisions</FieldLabel>
            <Controller
              control={control}
              name="divisionIds"
              render={({ field }) => (
                <div className="flex flex-col gap-2 rounded-lg border p-3">
                  {divisions.map((d) => {
                    const checked = (field.value ?? []).includes(d.id);
                    return (
                      <label key={d.id} className="flex items-center justify-between gap-2 text-sm">
                        {d.name}
                        <Switch
                          checked={checked}
                          onCheckedChange={(next) => {
                            const current = field.value ?? [];
                            field.onChange(next ? [...current, d.id] : current.filter((id) => id !== d.id));
                          }}
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            />
            <FieldError>{errors.divisionIds?.message}</FieldError>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="product-spec">Spec / Grade</FieldLabel>
              <Input id="product-spec" {...register("spec")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="product-recommended-label">Recommended Label</FieldLabel>
              <Input id="product-recommended-label" {...register("recommendedLabel")} />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="product-description">Description</FieldLabel>
            <Textarea id="product-description" rows={3} {...register("description")} />
          </Field>

          <ImageUploadField
            label="Product Image"
            defaultUrl={product?.imagePath ? storageUrl(product.imagePath) : null}
            onFileChange={setImageFile}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
            <Controller
              control={control}
              name="isRecommended"
              render={({ field }) => (
                <label className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                  Recommended
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <label className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                  Featured
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
