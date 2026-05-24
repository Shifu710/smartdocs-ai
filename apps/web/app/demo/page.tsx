"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { guestLogin, listWorkspaces, storeSession } from "@/lib/api";

export default function DemoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function openDemo() {
      try {
        const session = await guestLogin();
        if (!isMounted) {
          return;
        }
        storeSession(session);
        const workspaces = await listWorkspaces();
        const demoWorkspace = workspaces.find((workspace) => workspace.slug === "smartdocs-demo") ?? workspaces[0];
        if (!demoWorkspace) {
          throw new Error("Demo workspace is missing. Ask the platform admin to run the demo seed.");
        }
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
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{error ? "Demo unavailable" : "Opening guest demo"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          {error ? (
            <>
              <p>{error}</p>
              <div className="flex flex-wrap gap-3">
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
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
              Signing in as guest reviewer and locating the seeded SmartDocs workspace...
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
