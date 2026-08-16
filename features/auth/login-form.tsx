"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { login } from "@/actions/auth";
import { loginSchema, type LoginFormValues } from "@/features/auth/schema";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", values.email);
      formData.set("password", values.password);
      const result = await login(undefined, formData);
      if (result && !result.success) {
        toast.error(result.error ?? "Unable to sign in.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldError>{errors.email?.message}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <FieldError>{errors.password?.message}</FieldError>
      </Field>
      <Button type="submit" disabled={isPending} className="mt-2 h-11 w-full">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
