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
import { saveStat } from "@/actions/admin/content";
import { statFormSchema, type StatFormValues } from "@/features/admin/content/schema";
import type { stats } from "@/database/schema";

type Stat = typeof stats.$inferSelect;

export function StatFormDialog({ stat, trigger }: { stat: Stat; trigger: ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StatFormValues>({
    resolver: zodResolver(statFormSchema),
    defaultValues: { id: stat.id, value: stat.value, label: stat.label, sortOrder: stat.sortOrder },
  });

  const onSubmit = (values: StatFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(values.id));
      formData.set("value", values.value);
      formData.set("label", values.label);
      formData.set("sortOrder", String(values.sortOrder));

      const result = await saveStat(formData);
      if (result.success) {
        toast.success("Stat updated.");
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
          <DialogTitle>Edit Stat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="stat-value">Value</FieldLabel>
            <Input id="stat-value" placeholder="12+" aria-invalid={!!errors.value} {...register("value")} />
            <FieldError>{errors.value?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="stat-label">Label</FieldLabel>
            <Input id="stat-label" placeholder="Countries" aria-invalid={!!errors.label} {...register("label")} />
            <FieldError>{errors.label?.message}</FieldError>
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Stat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
