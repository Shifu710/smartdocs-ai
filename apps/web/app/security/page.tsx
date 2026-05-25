import { DatabaseZap, KeyRound, ListChecks, LockKeyhole, ShieldCheck, UserCog } from "lucide-react";
import Link from "next/link";

import { MarketingShell, PageIntro } from "@/components/marketing-shell";

const controls = [
  {
    title: "Workspace isolation",
    body: "Documents, chunks, members, settings, credits, and usage logs are scoped to workspace boundaries.",
    icon: LockKeyhole
  },
  {
    title: "Role-based flows",
    body: "Guest reviewer access is restricted, while owner workflows support document and workspace management.",
    icon: UserCog
  },
  {
    title: "Grounded retrieval",
    body: "Answers are connected to retrieved source chunks and citations so claims can be inspected.",
    icon: DatabaseZap
  },
  {
    title: "Usage audit trail",
    body: "AI calls create usage records for success and failure paths to make behavior easier to review.",
    icon: ListChecks
  }
];

export default function SecurityPage() {
  return (
    <MarketingShell>
      <PageIntro
        eyebrow="Security"
        title="Production-style security patterns for a portfolio RAG SaaS demo."
        description="SmartDocs AI demonstrates practical controls for review. It does not claim enterprise security certification or guarantee suitability for regulated production workloads."
      />

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-12 md:grid-cols-2">
        {controls.map((control) => {
          const Icon = control.icon;
          return (
            <article key={control.title} className="rounded-md border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold">{control.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{control.body}</p>
            </article>
          );
        })}
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
          <div>
            <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold">Honest scope</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This is a production-style Enterprise RAG SaaS demo and flagship portfolio project. It shows the
              architectural decisions and product controls a reviewer can evaluate, without claiming certification or
              commercial production readiness.
            </p>
          </div>
          <div>
            <KeyRound className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold">Provider and tracing readiness</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              DeepSeek/Qwen/OpenAI-compatible model routing and Langfuse tracing are ready when keys are configured.
              The public demo may use demo-local provider mode for reliability.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Need implementation details?</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Reviewer-focused architecture and QA context remains available on the technical review page.
          </p>
        </div>
        <Link
          href="/technical-review"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
        >
          Technical review
        </Link>
      </section>
    </MarketingShell>
  );
}
