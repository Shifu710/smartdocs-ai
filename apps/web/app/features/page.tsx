import { BarChart3, Database, FileText, MessageSquareText, SearchCheck, ShieldCheck, Workflow } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { MarketingShell, PageIntro } from "@/components/marketing-shell";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Workspace document library",
    body: "Upload and manage documents inside tenant-scoped workspaces with owner-controlled actions.",
    icon: FileText
  },
  {
    title: "Hybrid retrieval foundation",
    body: "Documents are chunked, embedded, and retrieved through the RAG pipeline before an answer is generated.",
    icon: SearchCheck
  },
  {
    title: "Cited streaming chat",
    body: "Answers stream back with source citations, chunk previews, retrieval scores, and provider metadata.",
    icon: MessageSquareText
  },
  {
    title: "Role-aware access",
    body: "Guests can review seeded data while owner actions such as upload and settings changes remain protected.",
    icon: ShieldCheck
  },
  {
    title: "Credits and usage logs",
    body: "Successful and failed AI calls are tracked so product behavior is inspectable during evaluation.",
    icon: BarChart3
  },
  {
    title: "AI provider gateway",
    body: "DeepSeek, Qwen, and OpenAI-compatible providers can be enabled when environment keys are configured.",
    icon: Workflow
  }
];

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <PageIntro
        eyebrow="Features"
        title="A full product surface for enterprise-style document intelligence."
        description="SmartDocs AI is more than a chat prompt over files. It demonstrates the surrounding SaaS behavior teams need around retrieval, permissions, citations, cost visibility, and review workflows."
      />

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-12 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <article key={feature.title} className="rounded-md border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
            </article>
          );
        })}
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Badge tone="muted">Retrieval and citations</Badge>
            <h2 className="mt-4 text-3xl font-semibold">Answers stay connected to the source material.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The demo shows how indexed chunks, retrieval scores, citations, and usage records fit together in a
              reviewer-friendly workflow.
            </p>
            <Link
              href="/demo"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try the demo
            </Link>
          </div>
          <div className="overflow-hidden rounded-md border border-border bg-background">
            <Image
              src="/marketing/rag-chat-citations.png"
              alt="SmartDocs AI cited answer interface"
              width={1440}
              height={4134}
              className="h-[500px] w-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-md border border-border bg-card p-6">
          <Database className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">Provider mode is transparent.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Public demo deployments can run with demo-local responses for reliability. DeepSeek/Qwen/OpenAI-compatible
            model calls and Langfuse tracing are ready when the matching environment variables are configured.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
