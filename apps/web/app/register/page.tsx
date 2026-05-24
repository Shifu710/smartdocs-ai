"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { register, storeSession } from "@/lib/api";

const registerSchema = z.object({
  full_name: z.string().max(255).optional(),
  email: z.string().email(),
  password: z.string().min(8)
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: RegisterForm) {
    setError(null);
    try {
      const session = await register(values.email, values.password, values.full_name);
      storeSession(session);
      router.push("/workspaces");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Register a standard user account for SmartDocs AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <label className="grid gap-2 text-sm font-medium">
              Name
              <Input autoComplete="name" {...form.register("full_name")} />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Email
              <Input type="email" autoComplete="email" {...form.register("email")} />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Password
              <Input type="password" autoComplete="new-password" {...form.register("password")} />
            </label>
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              {form.formState.isSubmitting ? "Creating..." : "Create account"}
            </Button>
          </form>
          <Link href="/login" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
