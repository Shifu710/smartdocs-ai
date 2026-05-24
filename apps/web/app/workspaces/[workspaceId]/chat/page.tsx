"use client";

import { Bot, FileText, Send, Sparkles } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessToken, listDocuments, streamChat, type ChatFinal } from "@/lib/api";

const suggestions = [
  "What is the refund policy?",
  "Summarize the security policy.",
  "What are the employee leave rules?",
  "What are the main product requirements?",
  "Compare the product spec and security policy."
];

export default function ChatPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("What is the refund policy?");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [final, setFinal] = useState<ChatFinal | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
    }
  }, [router]);

  const documentsQuery = useQuery({
    queryKey: ["documents", workspaceId],
    queryFn: () => listDocuments(workspaceId),
    enabled: Boolean(workspaceId) && Boolean(getAccessToken())
  });

  const indexedDocuments = useMemo(
    () => (documentsQuery.data ?? []).filter((document) => document.status === "indexed"),
    [documentsQuery.data]
  );

  function toggleDocument(documentId: string) {
    setSelectedDocuments((current) =>
      current.includes(documentId) ? current.filter((id) => id !== documentId) : [...current, documentId]
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim() || isStreaming) {
      return;
    }
    setAnswer("");
    setFinal(null);
    setError(null);
    setIsStreaming(true);
    try {
      const result = await streamChat(workspaceId, question, selectedDocuments, (token) => {
        setAnswer((current) => `${current}${token}`);
      });
      setFinal(result);
      queryClient.invalidateQueries({ queryKey: ["workspace-dashboard", workspaceId] });
    } catch (streamError) {
      setError(streamError instanceof Error ? streamError.message : "Chat failed");
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <AppShell title="RAG Chat" workspaceId={workspaceId}>
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Document filter</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {indexedDocuments.map((document) => (
                <label key={document.id} className="flex items-start gap-2 rounded-md border border-border p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document.id)}
                    onChange={() => toggleDocument(document.id)}
                    className="mt-1"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-medium">
                      <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                      {document.original_filename}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{document.chunk_count} chunks</span>
                  </span>
                </label>
              ))}
              <p className="text-xs text-muted-foreground">Leave all unchecked to search every indexed document.</p>
            </CardContent>
          </Card>
        </aside>

        <section className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
                Ask workspace documents
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setQuestion(suggestion)}
                    className="rounded-md border border-border px-3 py-2 text-xs hover:bg-muted"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="grid gap-3">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  className="min-h-28 rounded-md border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button type="submit" disabled={isStreaming}>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {isStreaming ? "Streaming..." : "Send"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          {answer ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                  Answer
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="whitespace-pre-wrap text-sm leading-7">{answer}</p>
                {final ? (
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="muted">{final.provider}</Badge>
                    <Badge tone="muted">{final.model}</Badge>
                    <Badge tone="warning">{final.credits_used} credits</Badge>
                    <Badge tone="muted">{final.total_tokens} tokens</Badge>
                    <Badge tone="muted">{final.latency_ms} ms</Badge>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {final ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Citations</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {final.citations.map((citation) => (
                    <article key={citation.chunk_id} className="rounded-md border border-border p-3">
                      <p className="text-sm font-medium">{citation.document_name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Chunk {citation.chunk_index} | RRF {citation.rrf_score}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{citation.preview}</p>
                    </article>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retrieval Debug Panel</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {final.debug.map((item) => (
                    <article key={item.chunk_id} className="rounded-md border border-border p-3 text-sm">
                      <p className="font-medium">{item.document_name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Vector #{item.vector_rank ?? "-"} | Keyword #{item.keyword_rank ?? "-"} | RRF {item.rrf_score}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Distance {item.vector_distance ?? "-"} | Keyword score {item.keyword_score ?? "-"}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">{item.preview}</p>
                    </article>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
