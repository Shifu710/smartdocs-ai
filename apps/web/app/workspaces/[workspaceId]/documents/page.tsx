"use client";

import { FileText, RefreshCcw, Upload } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { ListSkeleton } from "@/components/loading-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessToken, uploadDocument } from "@/lib/api";
import { documentsQuery as documentsQueryOptions, queryKeys, workspaceDashboardQuery } from "@/lib/queries";

export default function DocumentsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
    }
  }, [router]);

  const documentsQuery = useQuery({
    ...documentsQueryOptions(workspaceId),
    enabled: Boolean(workspaceId) && Boolean(getAccessToken())
  });

  const dashboardQuery = useQuery({
    ...workspaceDashboardQuery(workspaceId),
    enabled: Boolean(workspaceId) && Boolean(getAccessToken())
  });

  const role = dashboardQuery.data?.workspace.role;
  const canUpload = role === "owner" || role === "admin" || role === "member";

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocument(workspaceId, file),
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.documents(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaceDashboard(workspaceId) });
    },
    onError: (mutationError) => setError(mutationError instanceof Error ? mutationError.message : "Upload failed")
  });

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    event.target.value = "";
  }

  return (
    <AppShell title="Documents" workspaceId={workspaceId}>
      <div className="grid gap-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Knowledge base</h2>
            <p className="mt-1 text-sm text-muted-foreground">Upload PDF, DOCX, TXT, or Markdown files for indexing.</p>
          </div>
          {canUpload ? (
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload
              <input className="sr-only" type="file" accept=".pdf,.docx,.txt,.md" onChange={onFileChange} />
            </label>
          ) : (
            <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
              Guest demo is read-only. Upload and document changes are disabled for this role.
            </div>
          )}
        </section>

        {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Documents</CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.documents(workspaceId) })}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            {documentsQuery.isLoading ? <ListSkeleton rows={4} /> : null}
            {documentsQuery.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents yet. Seed data adds demo documents for guests.</p>
            ) : null}
            {documentsQuery.data?.map((document) => (
              <Link
                key={document.id}
                href={`/workspaces/${workspaceId}/documents/${document.id}`}
                className="grid gap-3 rounded-md border border-border p-4 hover:bg-muted md:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                    <h3 className="truncate text-sm font-semibold">{document.original_filename}</h3>
                    <Badge tone={document.status === "indexed" ? "success" : document.status === "failed" ? "warning" : "muted"}>
                      {document.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {document.file_type.toUpperCase()} | {(document.file_size_bytes / 1024).toFixed(1)} KB | SHA{" "}
                    {document.file_hash.slice(0, 12)}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">{document.chunk_count} chunks</div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
