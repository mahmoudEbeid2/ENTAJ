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
import { saveCtaPanel } from "@/actions/admin/content";
import { ctaPanelFormSchema, type CtaPanelFormValues } from "@/features/admin/content/schema";
import { storageUrl } from "@/lib/utils/asset-url";
import type { ctaPanels } from "@/database/schema";

type CtaPanel = typeof ctaPanels.$inferSelect;

const KEY_LABEL: Record<CtaPanel["key"], string> = {
  quality_compliance: "Quality & Compliance (Home)",
  home_contact_cta: "Contact CTA (Home)",
  about_contact_cta: "Contact CTA (About)",
};

export function CtaPanelFormDialog({ panel, trigger }: { panel: CtaPanel; trigger: ReactElement }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [illustrationFile, setIllustrationFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CtaPanelFormValues>({
    resolver: zodResolver(ctaPanelFormSchema),
    defaultValues: {
      id: panel.id,
      heading: panel.heading,
      subheading: panel.subheading ?? "",
      body: panel.body,
      buttonLabel: panel.buttonLabel ?? "",
      buttonHref: panel.buttonHref ?? "",
    },
  });

  const onSubmit = (values: CtaPanelFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", String(values.id));
      formData.set("heading", values.heading);
      formData.set("subheading", values.subheading ?? "");
      formData.set("body", values.body);
      formData.set("buttonLabel", values.buttonLabel ?? "");
      formData.set("buttonHref", values.buttonHref ?? "");
      if (iconFile) formData.set("icon", iconFile);
      if (illustrationFile) formData.set("illustration", illustrationFile);

      const result = await saveCtaPanel(formData);
      if (result.success) {
        toast.success("CTA panel updated.");
        setOpen(false);
        setIconFile(null);
        setIllustrationFile(null);
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
          <DialogTitle>Edit {KEY_LABEL[panel.key]}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="cta-heading">Heading</FieldLabel>
            <Input id="cta-heading" aria-invalid={!!errors.heading} {...register("heading")} />
            <FieldError>{errors.heading?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="cta-subheading">Subheading</FieldLabel>
            <Input id="cta-subheading" {...register("subheading")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="cta-body">Body</FieldLabel>
            <Textarea id="cta-body" rows={3} aria-invalid={!!errors.body} {...register("body")} />
            <FieldError>{errors.body?.message}</FieldError>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="cta-button-label">Button Label</FieldLabel>
              <Input id="cta-button-label" {...register("buttonLabel")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="cta-button-href">Button Link</FieldLabel>
              <Input id="cta-button-href" {...register("buttonHref")} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ImageUploadField label="Icon" defaultUrl={storageUrl(panel.iconPath)} onFileChange={setIconFile} />
            <ImageUploadField
              label="Illustration"
              defaultUrl={storageUrl(panel.illustrationPath)}
              onFileChange={setIllustrationFile}
              aspect="aspect-video"
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
