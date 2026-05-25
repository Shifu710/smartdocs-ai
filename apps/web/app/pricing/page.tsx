import { CheckCircle2, CreditCard, ServerCog } from "lucide-react";
import Link from "next/link";

import { MarketingShell, PageIntro } from "@/components/marketing-shell";
import { Badge } from "@/components/ui/badge";

const included = [
  "Workspace-scoped document library",
  "Cited RAG chat with retrieval context",
  "Guest reviewer and owner flows",
  "Credits and usage logs",
  "Demo-local provider fallback for public review",
  "DeepSeek/Qwen/OpenAI-compatible provider readiness"
];

export default function PricingPage() {
  return (
    <MarketingShell>
      <PageIntro
        eyebrow="Pricing"
        title="Evaluation-first access without fake checkout links."
        description="SmartDocs AI is presented as a flagship AI Native Full-Stack portfolio project and production-style Enterprise RAG SaaS demo. Commercial billing pages are intentionally not simulated."
      />

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-md border border-border bg-card p-6">
          <Badge tone="muted">Available now</Badge>
          <h2 className="mt-4 text-2xl font-semibold">Public demo</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Use the seeded guest workspace to evaluate the document, chat, citation, usage, and permission flows.
          </p>
          <Link
            href="/demo"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try demo
          </Link>
        </article>

        <article className="rounded-md border border-border bg-card p-6">
          <CreditCard className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-semibold">Commercial packaging is not implemented in the public demo.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The product includes credit accounting and usage logs to demonstrate SaaS billing discipline, but this
            website does not claim live payment processing, active subscriptions, or customer pricing tiers.
          </p>
        </article>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <ServerCog className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold">What the evaluation includes</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The demo is designed to show the product architecture honestly without pretending a production checkout
              system exists.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <div key={item} className="flex gap-3 rounded-md border border-border bg-background p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
