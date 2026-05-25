"use client";

import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { guestLogin, listWorkspaces, storeSession } from "@/lib/api";
import { documentsQuery, queryKeys, usageQuery, workspaceDashboardQuery } from "@/lib/queries";

const steps = ["Signing in guest reviewer...", "Loading demo workspace...", "Redirecting to dashboard..."];

export default function DemoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function openDemo() {
      try {
        setError(null);
        setActiveStep(0);
        const session = await guestLogin();
        if (!isMounted) {
          return;
        }
        storeSession(session);
        queryClient.setQueryData(queryKeys.me, session.user);
        setActiveStep(1);
        const workspaces = await listWorkspaces();
        const demoWorkspace = workspaces.find((workspace) => workspace.slug === "smartdocs-demo") ?? workspaces[0];
        if (!demoWorkspace) {
          throw new Error("Demo workspace is missing. Ask the platform admin to run the demo seed.");
        }
        queryClient.setQueryData(queryKeys.workspaces, workspaces);
        await Promise.allSettled([
          queryClient.prefetchQuery(workspaceDashboardQuery(demoWorkspace.id)),
          queryClient.prefetchQuery(documentsQuery(demoWorkspace.id)),
          queryClient.prefetchQuery(usageQuery(demoWorkspace.id))
        ]);
        router.prefetch(`/workspaces/${demoWorkspace.id}/dashboard`);
        router.prefetch(`/workspaces/${demoWorkspace.id}/documents`);
        router.prefetch(`/workspaces/${demoWorkspace.id}/chat`);
        router.prefetch(`/workspaces/${demoWorkspace.id}/usage`);
        setActiveStep(2);
        router.replace(`/workspaces/${demoWorkspace.id}/dashboard`);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Could not open the guest demo");
        }
      }
    }

    openDemo();

    return () => {
      isMounted = false;
    };
  }, [attempt, queryClient, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{error ? "Demo unavailable" : "Opening guest demo"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <p>Public demo may use demo-local provider mode for stability and cost control.</p>
          {error ? (
            <>
              <p>{error}</p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => setAttempt((value) => value + 1)}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Retry
                </Button>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Back to login
                </Link>
                <Link
                  href="/technical-review"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Technical review
                </Link>
              </div>
            </>
          ) : (
            <div className="grid gap-3">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  {index < activeStep ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
                  ) : index === activeStep ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-border" aria-hidden="true" />
                  )}
                  <span className={index <= activeStep ? "text-foreground" : ""}>{step}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
