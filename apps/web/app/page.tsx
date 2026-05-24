import {
  ArrowRight,
  BarChart3,
  Database,
  FileSearch,
  Github,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Tenant RAG workspaces",
    body: "Each workspace owns its documents, chunks, settings, credits, members, and usage logs.",
    icon: Database
  },
  {
    title: "Cited answers",
    body: "Chat streams answers with source citations, chunk previews, retrieval scores, and provider metadata.",
    icon: MessageSquareText
  },
  {
    title: "RBAC review mode",
    body: "Guest reviewers can inspect the seeded workspace without upload, delete, re-index, or settings writes.",
    icon: ShieldCheck
  },
  {
    title: "Usage visibility",
    body: "Successful AI calls deduct credits and produce audit-friendly usage records.",
    icon: BarChart3
  }
];

const flow = ["Upload", "Parse", "Chunk", "Embed", "Retrieve", "Rerank", "Answer", "Bill"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-base font-semibold">
            <FileSearch className="h-5 w-5 text-primary" aria-hidden="true" />
            SmartDocs AI
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/technical-review" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">
              Technical review
            </Link>
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <Badge tone="muted">Enterprise RAG SaaS demo</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
            SmartDocs AI turns private company documents into cited answers.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            A working full-stack RAG product with Next.js, FastAPI, PostgreSQL, pgvector-style retrieval, workspace
            isolation, RBAC, streaming chat, credits, and usage logs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try guest demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/technical-review"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
            >
              Read technical review
            </Link>
            <a
              href="https://github.com/Shifu710/smartdocs-ai"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              GitHub Repository
            </a>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live review workspace</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div className="rounded-md border border-border p-4">
              <p className="font-medium">Guest reviewer</p>
              <p className="mt-1 text-muted-foreground">guest@smartdocs.ai / guest123</p>
              <p className="mt-3 text-muted-foreground">
                Read-only access for asking questions, inspecting citations, and viewing usage behavior.
              </p>
            </div>
            <div className="rounded-md border border-border p-4">
              <p className="font-medium">Demo owner</p>
              <p className="mt-1 text-muted-foreground">demo@smartdocs.ai / demo12345</p>
              <p className="mt-3 text-muted-foreground">Owner access for uploads, re-indexing, and workspace review.</p>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-muted-foreground">
              <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
              Seeded demo data is isolated inside the SmartDocs demo tenant.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="grid gap-3">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="font-semibold">{feature.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{feature.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-2xl font-semibold">What the demo proves</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The review path exercises the same product surface a customer would use: login, workspace dashboard,
            document inventory, chat with citations, retrieval debug data, credit deduction, and usage history.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {flow.map((step) => (
            <div key={step} className="rounded-md border border-border bg-card p-4 text-center text-sm font-medium">
              {step}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold">Live demo flow</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Open the guest demo, land in the seeded workspace, inspect indexed documents, ask a cited RAG question,
              verify credits and usage logs, then review architecture details.
            </p>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <h3 className="font-semibold">Architecture mini-diagram</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Next.js UI to FastAPI to JWT/RBAC to document indexing to pgvector and full-text retrieval to LangGraph
              RAG flow to ModelGateway to credits, usage logs, and optional Langfuse tracing.
            </p>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <h3 className="font-semibold">Provider mode</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The public demo uses demo-local provider when real model keys are not configured. Real DeepSeek/Qwen
              support is available when environment variables are configured.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Tech stack</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Next.js", "TypeScript", "FastAPI", "SQLAlchemy", "PostgreSQL", "pgvector", "LangGraph", "DeepSeek-ready", "Qwen-ready", "Langfuse-ready", "Vercel"].map(
              (item) => (
                <Badge key={item} tone="muted">
                  {item}
                </Badge>
              )
            )}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">AI Native role signal</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            SmartDocs shows product delivery beyond a chat box: multi-tenant SaaS boundaries, RBAC, document processing,
            hybrid retrieval, citations, billing discipline, observability hooks, and an HR-ready public demo.
          </p>
        </div>
      </section>
    </main>
  );
}
