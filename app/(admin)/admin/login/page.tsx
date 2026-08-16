import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Admin Login — ENTAJ" };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-entaj-light-grey px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <div className="mb-8 text-center">
          <span className="text-gradient-entaj font-expanded text-2xl font-bold uppercase">
            Entaj
          </span>
          <p className="mt-1 text-sm text-entaj-medium-grey">Sign in to the admin panel</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
