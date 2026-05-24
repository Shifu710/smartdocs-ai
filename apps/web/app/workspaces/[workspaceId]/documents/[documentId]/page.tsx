"use client";

import { ArrowLeft, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessToken, getDocument, getWorkspaceDashboard, reindexDocument } from "@/lib/api";

export default function DocumentDetailPage() {
  const params = useParams<{ workspaceId: string; documentId: string }>();
  const { workspaceId, documentId } = params;
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
    }
  }, [router]);

  const documentQuery = useQuery({
    queryKey: ["document", workspaceId, documentId],
    queryFn: () => getDocument(workspaceId, documentId),
    enabled: Boolean(workspaceId) && Boolean(documentId) && Boolean(getAccessToken())
  });

  const dashboardQuery = useQuery({
    queryKey: ["workspace-dashboard", workspaceId],
    queryFn: () => getWorkspaceDashboard(workspaceId),
    enabled: Boolean(workspaceId) && Boolean(getAccessToken())
  });

  const reindexMutation = useMutation({
    mutationFn: () => reindexDocument(workspaceId, documentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["document", workspaceId, documentId] })
  });

  const document = documentQuery.data;
  const role = dashboardQuery.data?.workspace.role;
  const canReindex = role === "owner" || role === "admin";

  return (
    <AppShell title={document?.original_filename ?? "Document"} workspaceId={workspaceId}>
      <div className="grid gap-5">
        <Link href={`/workspaces/${workspaceId}/documents`} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to documents
        </Link>

        {document ? (
          <>
            <section className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{document.original_filename}</h2>
                  <Badge tone={document.status === "indexed" ? "success" : "muted"}>{document.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {document.file_type.toUpperCase()} | {(document.file_size_bytes / 1024).toFixed(1)} KB | SHA{" "}
                  {document.file_hash.slice(0, 12)}
                </p>
              </div>
              {canReindex ? (
                <Button type="button" variant="secondary" onClick={() => reindexMutation.mutate()}>
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  Re-index
                </Button>
              ) : (
                <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                  Read-only access. Re-index is disabled for this role.
                </div>
              )}
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Chunks</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {document.chunks.map((chunk) => (
                  <article key={chunk.id} className="rounded-md border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>Chunk {chunk.chunk_index}</span>
                      <span>{chunk.token_count} estimated tokens</span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{chunk.content}</p>
                  </article>
                ))}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="text-sm text-muted-foreground">Loading document...</CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
