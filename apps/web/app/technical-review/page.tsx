import { ArrowRight, CheckCircle2, Database, GitBranch, LockKeyhole, Server, ShieldCheck, WalletCards } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const proofPoints = [
  "Guest demo login finds the seeded SmartDocs workspace and opens the dashboard.",
  "Four seeded documents are indexed and available for cited RAG answers.",
  "Chat streams tokens, returns citations, exposes retrieval debug data, and records provider metadata.",
  "Successful calls deduct credits and create usage records; failed calls do not deduct credits.",
  "Viewer roles can read and ask questions, while write controls are hidden from the UI."
];

const codeLinks = [
  "services/api/app/services/chat_service.py",
  "services/api/app/services/retrieval_service.py",
  "services/api/app/repositories/retrieval_repository.py",
  "services/api/app/ai/model_gateway.py",
  "services/api/app/ai/embedding_gateway.py",
  "services/api/app/rag/rag_graph.py",
  "services/api/app/models/conversation.py",
  "services/api/app/observability/tracing.py",
  "services/api/app/services/document_service.py",
  "services/api/app/services/billing_service.py",
  "services/api/app/api/v1/chat.py",
  "services/api/app/api/v1/admin.py",
  "apps/web/app/demo/page.tsx",
  "apps/web/app/workspaces/[workspaceId]/chat/page.tsx",
  "apps/web/app/workspaces/[workspaceId]/usage/page.tsx"
];

const reviewSections = [
  {
    title: "Document Indexing",
    icon: Database,
    body: "Uploads are stored per workspace, parsed into text, split into chunks, and persisted with document metadata. The demo seed endpoint creates review-ready documents so the public deployment can be tested without manual setup."
  },
  {
    title: "RAG Retrieval",
    icon: GitBranch,
    body: "The chat flow uses a RetrievalService with pgvector similarity SQL, PostgreSQL full-text search, and reciprocal rank fusion. If a local database lacks vector support, the service falls back to deterministic Python ranking for demo continuity."
  },
  {
    title: "Model Gateway",
    icon: Server,
    body: "The no-key production path is explicitly labeled demo-local. The backend is structured so real DeepSeek, Qwen, or OpenAI-compatible model calls can replace deterministic demo answers through environment configuration."
  },
  {
    title: "RBAC",
    icon: ShieldCheck,
    body: "Workspace roles are returned with dashboard data and used by the UI to hide upload, re-index, invite, and settings actions from guest/viewer sessions."
  },
  {
    title: "Credits",
    icon: WalletCards,
    body: "Credit deduction happens after a successful AI response and is written alongside usage logs. This keeps billing visible and prevents failed model calls from consuming balance."
  },
  {
    title: "LangGraph Flow",
    icon: GitBranch,
    body: "The RAG request moves through validate_access, check_credits, rewrite_query, retrieve, build_context, generate, and finalize nodes. Finalize deducts credits and writes the usage log after generation succeeds."
  },
  {
    title: "Tenant Isolation",
    icon: LockKeyhole,
    body: "Every workspace route and API request is scoped by workspace id. Documents, chunks, credits, members, settings, and usage records are tenant-owned surfaces."
  }
];

const deepDiveSections = [
  "Document indexing flow: upload, type validation, extraction, chunking, embedding generation, chunk persistence, and indexed status update.",
  "RAG chat flow: JWT workspace request, RBAC check, credit precheck, retrieval, context build, ModelGateway generation, citations, billing, and usage log.",
  "Hybrid retrieval algorithm: pgvector distance and PostgreSQL full-text search are merged by reciprocal rank fusion.",
  "ModelGateway provider strategy: DeepSeek first, Qwen fallback, OpenAI-compatible optional fallback, then demo-local when no keys are configured.",
  "Embedding provider strategy: Qwen embeddings when configured, deterministic hash embeddings for public demo fallback.",
  "Failed-call no-deduction logic: exceptions roll back pending writes, add failed usage logs with zero credits, and avoid exposing provider secrets.",
  "Usage logs and audit trail: status, provider, model, tokens, latency, credits, trace id, and error details are recorded.",
  "RBAC and tenant isolation: workspace membership gates routes; guest/viewer users see read-only UI for risky actions.",
  "Langfuse observability: tracing code is implemented and safely disabled unless Langfuse keys are configured.",
  "Conversation history: each RAG call can persist user and assistant messages with citations, provider, model, tokens, credits, latency, and trace id.",
  "Security guardrails: document content is treated as untrusted context and workspace membership gates protected routes.",
  "Test coverage summary: backend gateway, retrieval, security, and RRF tests run in CI alongside frontend type-check, lint, and build.",
  "Production deployment notes: the live Vercel deployment serves frontend routes and FastAPI under the /_/api prefix."
];

export default function TechnicalReviewPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-semibold">
            SmartDocs AI
          </Link>
          <Link href="/demo" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            Try guest demo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
        <section className="max-w-4xl">
          <Badge tone="muted">Technical review</Badge>
          <h1 className="mt-4 text-3xl font-semibold md:text-5xl">SmartDocs AI Enterprise RAG SaaS</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            This page is written for a reviewer evaluating product depth and engineering execution. It summarizes the
            live demo, architecture, security boundaries, billing behavior, limitations, and source files worth reading.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs leading-6">
{`flowchart LR
  Web[Next.js App Router] --> API[FastAPI API]
  API --> Auth[JWT Auth + Workspace RBAC]
  API --> Docs[Document Service]
  Docs --> Storage[/uploads volume]
  Docs --> Worker[Indexing path]
  Worker --> Chunks[(PostgreSQL document chunks)]
  API --> Chat[Streaming Chat Route]
  Chat --> Graph[LangGraph RAG Nodes]
  Graph --> Retrieval[pgvector + Full-text + RRF]
  Graph --> Gateway[DeepSeek/Qwen/OpenAI-compatible or demo-local]
  Graph --> Langfuse[Optional Langfuse Trace]
  Chat --> Billing[Credits + Usage Logs]
  Billing --> DB[(PostgreSQL)]`}
            </pre>
          </CardContent>
        </Card>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>What to verify live</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {proofPoints.map((point) => (
                <div key={point} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {reviewSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-muted-foreground">{section.body}</CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Request flow</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground">
              <p>1. The browser authenticates with JWT and sends workspace-scoped API requests.</p>
              <p>2. FastAPI checks the workspace membership and role before returning tenant data.</p>
              <p>3. LangGraph runs access, credit, retrieval, context, generation, and finalize nodes.</p>
              <p>4. Credits and usage logs are written only after the answer is complete.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Known limitations</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground">
              <p>The public demo uses a deterministic demo-local provider when external model keys are absent.</p>
              <p>Langfuse traces are disabled in the public demo unless LANGFUSE keys are configured.</p>
              <p>Settings and invites are intentionally read-only in the public demo to avoid mutation risk on the shared deployment.</p>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Engineering details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-2">
            {deepDiveSections.map((section) => (
              <p key={section}>{section}</p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source files to review</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            {codeLinks.map((path) => (
              <code key={path} className="rounded-md border border-border bg-muted px-3 py-2">
                {path}
              </code>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
