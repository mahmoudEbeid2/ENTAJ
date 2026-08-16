"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveMarketRegion } from "@/actions/admin/content";
import { marketRegionFormSchema, type MarketRegionFormValues } from "@/features/admin/content/schema";
import type { marketRegions } from "@/database/schema";

type MarketRegion = typeof marketRegions.$inferSelect;

export function MarketRegionFormDialog({ region, trigger }: { region: MarketRegion; trigger: ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MarketRegionFormValues>({
    resolver: zodResolver(marketRegionFormSchema),
    defaultValues: {
      id: region.id,
      name: region.name,
      countries: region.countries,
      sortOrder: region.sortOrder,
    },
  });

  const onSubmit = (values: MarketRegionFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(values.id));
      formData.set("name", values.name);
      formData.set("countries", values.countries);
      formData.set("sortOrder", String(values.sortOrder));

      const result = await saveMarketRegion(formData);
      if (result.success) {
        toast.success("Region updated.");
        setOpen(false);
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
          <DialogTitle>Edit Region</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="region-name">Region Name</FieldLabel>
            <Input id="region-name" aria-invalid={!!errors.name} {...register("name")} />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="region-countries">Countries</FieldLabel>
            <Input
              id="region-countries"
              placeholder="Jordan, Saudi Arabia, UAE"
              aria-invalid={!!errors.countries}
              {...register("countries")}
            />
            <FieldError>{errors.countries?.message}</FieldError>
          </Field>
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
