import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TechnicalReviewPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-5xl gap-6 px-4 py-10">
      <section>
        <h1 className="text-3xl font-semibold">SmartDocs AI Technical Review</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Enterprise RAG SaaS with Next.js, FastAPI, PostgreSQL/pgvector, Redis/Celery, LangGraph-style pipeline,
          citations, workspace isolation, credit billing, usage logs, and a clearly labeled demo-local provider.
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
  API --> Auth[JWT Auth + RBAC]
  API --> Docs[Document Service]
  Docs --> Storage[/uploads volume]
  Docs --> Worker[Celery Worker]
  Worker --> Chunks[PostgreSQL + pgvector chunks]
  API --> RAG[LangGraph RAG Pipeline]
  RAG --> Retrieval[Hybrid Retrieval + RRF]
  RAG --> Gateway[DeepSeek/Qwen/OpenAI Gateway or demo-local]
  RAG --> Billing[Atomic Credits + Usage Logs]
  Billing --> DB[(PostgreSQL)]`}
          </pre>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Implemented Flow</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Guest demo login enters the seeded workspace, shows four indexed documents, streams a RAG answer,
            displays citations and retrieval debug data, deducts credits after success, and records a usage log.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Provider Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            The current no-key path is labeled demo-local in the UI and logs. Configure DeepSeek and Qwen keys in the
            backend environment to swap deterministic demo responses for real model calls.
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

