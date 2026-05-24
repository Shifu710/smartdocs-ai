"use client";

import { Activity, Coins, Gauge, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessToken, getUsage } from "@/lib/api";

const metrics = [
  { key: "credits", label: "Credits", icon: Coins },
  { key: "total_calls", label: "AI calls", icon: Activity },
  { key: "successful_calls", label: "Successful", icon: Gauge },
  { key: "failed_calls", label: "Failed", icon: XCircle }
] as const;

export default function UsagePage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
    }
  }, [router]);

  const usageQuery = useQuery({
    queryKey: ["usage", workspaceId],
    queryFn: () => getUsage(workspaceId),
    enabled: Boolean(workspaceId) && Boolean(getAccessToken())
  });

  return (
    <AppShell title="Usage" workspaceId={workspaceId}>
      <div className="grid gap-5">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-3xl font-semibold">{usageQuery.data?.[metric.key] ?? 0}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Usage logs</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Time</th>
                  <th>Operation</th>
                  <th>Status</th>
                  <th>Provider</th>
                  <th>Tokens</th>
                  <th>Credits</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {usageQuery.data?.logs.map((log) => (
                  <tr key={log.id} className="border-t border-border">
                    <td className="py-3 text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                    <td>{log.operation_type}</td>
                    <td>
                      <Badge tone={log.status === "success" ? "success" : "warning"}>{log.status}</Badge>
                    </td>
                    <td>{log.provider ?? "-"}</td>
                    <td>{log.total_tokens}</td>
                    <td>{log.credits_deducted}</td>
                    <td>{log.latency_ms ?? 0} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

