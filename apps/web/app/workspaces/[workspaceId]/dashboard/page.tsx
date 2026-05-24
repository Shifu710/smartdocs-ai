"use client";

import { Activity, Building2, FileText, ShieldCheck, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { CreditBadge } from "@/components/credit-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessToken, getWorkspaceDashboard } from "@/lib/api";

const metricCards = [
  { key: "member_count", label: "Members", icon: Users },
  { key: "document_count", label: "Documents", icon: FileText },
  { key: "indexed_document_count", label: "Indexed", icon: ShieldCheck },
  { key: "recent_usage_count", label: "AI calls", icon: Activity }
] as const;

export default function WorkspaceDashboardPage() {
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
    enabled: Boolean(workspaceId) && typeof window !== "undefined" && Boolean(getAccessToken())
  });

  const workspace = dashboardQuery.data?.workspace;

  return (
    <AppShell title={workspace?.name ?? "Workspace Dashboard"} workspaceId={workspaceId}>
      {dashboardQuery.isLoading ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">Loading dashboard...</CardContent>
        </Card>
      ) : null}

      {dashboardQuery.error ? (
        <Card>
          <CardContent className="text-sm text-red-700">
            {dashboardQuery.error instanceof Error ? dashboardQuery.error.message : "Could not load dashboard"}
          </CardContent>
        </Card>
      ) : null}

      {dashboardQuery.data ? (
        <div className="grid gap-6">
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="text-xl font-semibold">{workspace?.name}</h2>
                {workspace?.role ? <Badge tone="muted">{workspace.role}</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Tenant slug: {workspace?.slug}</p>
            </div>
            {workspace ? <CreditBadge credits={workspace.credits} /> : null}
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.key}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                    <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-3xl font-semibold">{dashboardQuery.data[metric.key]}</p>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Retrieval settings</CardTitle>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phase 1 status</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground">
                <p>Authentication, JWT protection, workspace isolation, and role-aware dashboard access are wired.</p>
                <p>Document upload, LangGraph RAG, billing, and observability land in later phases from the spec.</p>
              </CardContent>
            </Card>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
