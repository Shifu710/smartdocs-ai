"use client";

import { LockKeyhole, Settings } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessToken, getWorkspaceDashboard } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
    }
  }, [router]);

  const dashboardQuery = useQuery({
    queryKey: ["workspace-dashboard", workspaceId],
    queryFn: () => getWorkspaceDashboard(workspaceId),
    enabled: Boolean(workspaceId) && Boolean(getAccessToken())
  });

  const workspace = dashboardQuery.data?.workspace;
  const role = workspace?.role;
  const canEdit = role === "owner" || role === "admin";

  return (
    <AppShell title="Settings" workspaceId={workspaceId}>
      <div className="grid gap-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
              Workspace settings
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Configuration snapshot for the active tenant.</p>
          </div>
          <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            {canEdit ? "Settings writes are disabled in the public demo." : "Guest demo is read-only. Settings actions are hidden."}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tenant</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="rounded-md border border-border p-3">
                <p className="text-muted-foreground">Name</p>
                <p className="mt-1 font-medium">{workspace?.name ?? "Loading..."}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-muted-foreground">Slug</p>
                <p className="mt-1 font-medium">{workspace?.slug ?? "Loading..."}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-muted-foreground">Your role</p>
                <div className="mt-1">{role ? <Badge tone={role === "viewer" ? "muted" : "success"}>{role}</Badge> : "Loading..."}</div>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-muted-foreground">Credits</p>
                <p className="mt-1 font-medium">{workspace?.credits ?? "Loading..."}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retrieval</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(workspace?.settings ?? {}).map(([key, value]) => (
                  <div key={key} className="rounded-md border border-border p-3">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
                Provider fallback is labeled demo-local until production model keys are configured.
              </div>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>AI provider status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-md border border-border p-3">
              <p className="text-muted-foreground">Model provider mode</p>
              <p className="mt-1 font-medium">auto with demo-local fallback</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-muted-foreground">Embedding provider mode</p>
              <p className="mt-1 font-medium">qwen when configured, otherwise demo-local</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-muted-foreground">Langfuse status</p>
              <p className="mt-1 font-medium">disabled unless keys are configured</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
