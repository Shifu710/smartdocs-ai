"use client";

import { Activity, Coins, Gauge, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [operationFilter, setOperationFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

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

  const logs = useMemo(() => usageQuery.data?.logs ?? [], [usageQuery.data?.logs]);
  const providers = useMemo(() => Array.from(new Set(logs.map((log) => log.provider).filter(Boolean))) as string[], [logs]);
  const operations = useMemo(() => Array.from(new Set(logs.map((log) => log.operation_type))), [logs]);
  const filteredLogs = logs.filter((log) => {
    const matchesDate = !dateFilter || log.created_at.slice(0, 10) === dateFilter;
    return (
      (statusFilter === "all" || log.status === statusFilter) &&
      (providerFilter === "all" || log.provider === providerFilter) &&
      (operationFilter === "all" || log.operation_type === operationFilter) &&
      matchesDate
    );
  });
  const averageLatency = filteredLogs.length
    ? Math.round(filteredLogs.reduce((total, log) => total + (log.latency_ms ?? 0), 0) / filteredLogs.length)
    : 0;
  const providerBreakdown = providers
    .map((provider) => `${provider}: ${logs.filter((log) => log.provider === provider).length}`)
    .join(" | ");

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

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Provider/model breakdown</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {providerBreakdown || "No provider calls yet."}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Average latency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{averageLatency} ms</p>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Usage logs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 overflow-x-auto">
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={providerFilter}
                onChange={(event) => setProviderFilter(event.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All providers</option>
                {providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
              <select
                value={operationFilter}
                onChange={(event) => setOperationFilter(event.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All operations</option>
                {operations.map((operation) => (
                  <option key={operation} value={operation}>
                    {operation}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
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
                  <th>Trace</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
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
                    <td className="max-w-[160px] truncate text-muted-foreground">{log.langfuse_trace_id ?? "-"}</td>
                    <td className="max-w-[220px] truncate text-muted-foreground">{log.error_message ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit transactions</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Time</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance after</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {usageQuery.data?.transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-t border-border">
                    <td className="py-3 text-muted-foreground">{new Date(transaction.created_at).toLocaleString()}</td>
                    <td>{transaction.transaction_type}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.balance_after}</td>
                    <td className="max-w-[260px] truncate text-muted-foreground">
                      {JSON.stringify(transaction.transaction_metadata)}
                    </td>
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
