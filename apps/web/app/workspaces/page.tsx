"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Plus, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { CreditBadge } from "@/components/credit-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createWorkspace, getAccessToken, listWorkspaces } from "@/lib/api";

const workspaceSchema = z.object({
  name: z.string().min(2).max(160)
});

type WorkspaceForm = z.infer<typeof workspaceSchema>;

export default function WorkspacesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: "" }
  });

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
    }
  }, [router]);

  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: listWorkspaces,
    enabled: typeof window !== "undefined" && Boolean(getAccessToken())
  });

  const createMutation = useMutation({
    mutationFn: (values: WorkspaceForm) => createWorkspace(values.name),
    onSuccess: async (workspace) => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      router.push(`/workspaces/${workspace.id}/dashboard`);
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not create workspace")
  });

  return (
    <AppShell title="Workspaces">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Your workspaces</h2>
              <p className="text-sm text-muted-foreground">Each workspace is an isolated tenant for documents and credits.</p>
            </div>
            <Button type="button" variant="secondary" size="icon" onClick={() => workspacesQuery.refetch()} title="Refresh">
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {workspacesQuery.isLoading ? (
            <Card>
              <CardContent className="text-sm text-muted-foreground">Loading workspaces...</CardContent>
            </Card>
          ) : null}

          {workspacesQuery.data?.length === 0 ? (
            <Card>
              <CardContent className="text-sm text-muted-foreground">No workspaces yet. Create one to start.</CardContent>
            </Card>
          ) : null}

          <div className="grid gap-3">
            {workspacesQuery.data?.map((workspace) => (
              <Link key={workspace.id} href={`/workspaces/${workspace.id}/dashboard`}>
                <Card className="transition hover:border-primary/50">
                  <CardContent className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
                        <h3 className="truncate font-semibold">{workspace.name}</h3>
                        <Badge tone="muted">{workspace.role}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{workspace.slug}</p>
                    </div>
                    <CreditBadge credits={workspace.credits} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Create workspace</CardTitle>
            <CardDescription>New workspaces start with 1,000 credits.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit((values) => {
                setError(null);
                createMutation.mutate(values);
              })}
            >
              <label className="grid gap-2 text-sm font-medium">
                Workspace name
                <Input placeholder="Acme Knowledge Base" {...form.register("name")} />
              </label>
              {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
              <Button type="submit" disabled={createMutation.isPending}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
