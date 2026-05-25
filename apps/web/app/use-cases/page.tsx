import { Building2, FileQuestion, GraduationCap, Scale, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import { MarketingShell, PageIntro } from "@/components/marketing-shell";

const useCases = [
  {
    title: "HR policy assistant",
    body: "Help employees find cited answers across handbook, benefits, onboarding, and internal policy documents.",
    icon: Users
  },
  {
    title: "Operations knowledge base",
    body: "Centralize playbooks, process docs, SOPs, and meeting notes into workspace-scoped RAG search.",
    icon: Building2
  },
  {
    title: "Compliance review support",
    body: "Inspect citations and retrieval traces while keeping claims grounded in uploaded source documents.",
    icon: Scale
  },
  {
    title: "Internal training support",
    body: "Let new team members ask questions against approved internal material instead of searching scattered files.",
    icon: GraduationCap
  }
];

export default function UseCasesPage() {
  return (
    <MarketingShell>
      <PageIntro
        eyebrow="Use cases"
        title="Document intelligence for teams with private knowledge."
        description="SmartDocs AI is positioned for internal document workflows where source-grounded answers, workspace separation, and audit-friendly usage matter."
      />

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-12 md:grid-cols-2">
        {useCases.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-md border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </article>
          );
        })}
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-3">
          <div>
            <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold">For workspace owners</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Upload and manage documents, inspect indexing status, and review usage inside the workspace surface.
            </p>
          </div>
          <div>
            <FileQuestion className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold">For knowledge seekers</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Ask natural-language questions and inspect cited answer sources instead of trusting unsupported output.
            </p>
          </div>
          <div>
            <Users className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold">For reviewers</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use guest access and the technical review page to evaluate architecture, permissions, and demo behavior.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">See the seeded workspace in action.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The public demo is designed for evaluation, not as a fake customer deployment.
          </p>
        </div>
        <Link
          href="/demo"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Open demo
        </Link>
      </section>
    </MarketingShell>
  );
}
