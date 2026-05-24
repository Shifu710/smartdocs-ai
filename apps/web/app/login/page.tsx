"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, KeyRound, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login, storeSession } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "demo@smartdocs.ai",
      password: "demo12345"
    }
  });

  async function onSubmit(values: LoginForm) {
    setError(null);
    try {
      const session = await login(values.email, values.password);
      storeSession(session);
      router.push("/workspaces");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
        <section className="flex flex-col justify-center">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center rounded-sm border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
              Enterprise RAG SaaS
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground md:text-5xl">SmartDocs AI</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Secure workspace knowledge bases with RBAC, credits, retrieval, citations, and AI usage visibility.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/" className="text-sm font-medium text-primary">
                Product overview
              </Link>
              <Link href="/technical-review" className="text-sm font-medium text-primary">
                Technical review
              </Link>
              <a href="https://github.com/Shifu710/smartdocs-ai" className="text-sm font-medium text-primary">
                GitHub repository
              </a>
            </div>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use the seeded demo account or start the guest review session.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <label className="grid gap-2 text-sm font-medium">
                Email
                <Input type="email" autoComplete="email" {...form.register("email")} />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Password
                <Input type="password" autoComplete="current-password" {...form.register("password")} />
              </label>
              {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-4 grid gap-3">
              <Button type="button" variant="secondary" onClick={() => router.push("/demo")}>
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Try guest demo
              </Button>
              <Link href="/register" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                Create account
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-5 grid gap-3 rounded-md border border-border bg-muted p-4 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
                Demo accounts
              </div>
              <div className="grid gap-2 text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Owner:</span> demo@smartdocs.ai / demo12345
                </p>
                <p>
                  <span className="font-medium text-foreground">Guest reviewer:</span> guest@smartdocs.ai / guest123
                </p>
                <p>Guest access is read-only: ask questions and inspect citations without upload, delete, re-index, or settings actions.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
