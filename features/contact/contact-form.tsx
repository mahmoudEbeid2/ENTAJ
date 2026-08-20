"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { submitContactMessage } from "@/actions/contact";
import { contactFormSchema, type ContactFormValues } from "@/features/contact/schema";

export function ContactForm({
  divisions,
  initialDivisionId,
  initialMessage,
}: {
  divisions: { id: number; name: string }[];
  initialDivisionId?: number;
  initialMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { divisionId: initialDivisionId, message: initialMessage ?? "" },
  });

  const selectedDivisionId = watch("divisionId");

  const onSubmit = (values: ContactFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("fullName", values.fullName);
      formData.set("company", values.company ?? "");
      formData.set("phone", values.phone ?? "");
      formData.set("email", values.email);
      if (values.divisionId) formData.set("divisionId", String(values.divisionId));
      formData.set("message", values.message);

      const result = await submitContactMessage(undefined, formData);
      if (result.success) {
        setSubmitted(true);
        reset();
        toast.success("Your message has been sent. We'll respond within 24 hours.");
      } else {
        toast.error(result.error ?? "Please check the form and try again.");
      }
    });
  };

  if (submitted) {
    return (
      <div
        role="status"
        className="animate-in fade-in zoom-in-95 duration-500 ease-out rounded-[24px] bg-entaj-light-grey p-8 text-center"
      >
        <p className="font-expanded text-xl text-entaj-blue">Thank you — your message has been sent.</p>
        <p className="mt-2 text-entaj-medium-grey">We will respond with availability, pricing, and documentation within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="fullName" className="text-gradient-entaj font-expanded text-lg">FULL NAME</FieldLabel>
          <Input
            id="fullName"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            className="h-[50px] rounded-lg text-base"
            {...register("fullName")}
          />
          <FieldError>{errors.fullName?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="company" className="text-gradient-entaj font-expanded text-lg">COMPANY</FieldLabel>
          <Input id="company" autoComplete="organization" className="h-[50px] rounded-lg text-base" {...register("company")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone" className="text-gradient-entaj font-expanded text-lg">PHONE</FieldLabel>
          <Input id="phone" type="tel" autoComplete="tel" className="h-[50px] rounded-lg text-base" {...register("phone")} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email" className="text-gradient-entaj font-expanded text-lg">E-MAIL</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="h-[50px] rounded-lg text-base"
            {...register("email")}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>
      </div>

      {divisions.length > 0 ? (
        <fieldset>
          <legend className="text-gradient-entaj mb-6 w-full text-center font-sans text-3xl font-bold lg:text-[45px]">
            DIVISION OF INTEREST
          </legend>
          <div className="flex flex-wrap justify-center gap-4">
            {divisions.map((division) => (
              <button
                key={division.id}
                type="button"
                aria-pressed={selectedDivisionId === division.id}
                onClick={() =>
                  setValue("divisionId", selectedDivisionId === division.id ? undefined : division.id)
                }
                className={cn(
                  "h-16 min-w-[268px] rounded-full bg-entaj-light-grey px-8 font-expanded text-lg text-entaj-blue transition-all duration-200 hover:-translate-y-0.5 hover:bg-entaj-light-grey/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-entaj-blue",
                  selectedDivisionId === division.id && "bg-entaj-blue text-white hover:bg-entaj-blue/90",
                )}
              >
                {division.name}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <Field>
        <FieldLabel htmlFor="message" className="text-gradient-entaj font-expanded text-lg">MESSAGE</FieldLabel>
        <Textarea
          id="message"
          rows={6}
          placeholder="Describe the specification you're looking for..."
          aria-invalid={!!errors.message}
          className="rounded-lg text-base"
          {...register("message")}
        />
        <FieldError>{errors.message?.message}</FieldError>
      </Field>

      <Button
        type="submit"
        disabled={isPending}
        className="h-[86px] w-full rounded-3xl bg-entaj-blue text-lg text-entaj-light-grey transition-all duration-200 hover:-translate-y-0.5 hover:bg-entaj-blue/90 hover:shadow-lg"
      >
        {isPending ? "Sending..." : "Send Request"}
      </Button>
    </form>
  );
}
