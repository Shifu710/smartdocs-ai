import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Database,
  FileSearch,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { MarketingShell } from "@/components/marketing-shell";
import { Badge } from "@/components/ui/badge";

const outcomes = [
  {
    title: "Ask questions across private documents",
    body: "Teams can search policies, handbooks, notes, and internal knowledge through a cited RAG chat interface.",
    icon: MessageSquareText
  },
  {
    title: "Keep answers tied to sources",
    body: "Responses include citations and retrieval context so reviewers can inspect where each answer came from.",
    icon: BookOpenCheck
  },
  {
    title: "Separate each workspace",
    body: "Workspace boundaries cover documents, chunks, members, settings, credits, and usage history.",
    icon: Database
  },
  {
    title: "Review usage with discipline",
    body: "Credits and usage logs make AI calls visible instead of hiding cost behavior inside the chat box.",
    icon: BarChart3
  }
];

const workflow = ["Upload", "Index", "Retrieve", "Answer", "Cite", "Log"];

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="relative min-h-[78vh] overflow-hidden border-b border-border bg-card">
        <Image
          src="/marketing/workspace-dashboard.png"
          alt="SmartDocs AI workspace dashboard screenshot"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right-top opacity-25 md:opacity-40"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--card))_0%,hsl(var(--card)/0.92)_43%,hsl(var(--card)/0.18)_100%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 py-16 md:min-h-[78vh]">
          <Badge tone="muted">Enterprise RAG SaaS demo</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
            Secure document intelligence for teams that need cited answers.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            SmartDocs AI helps organizations turn internal documents into searchable, cited knowledge with workspaces,
            RBAC, streaming chat, retrieval visibility, credits, and usage logs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try live demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/features"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
            >
              Explore features
            </Link>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
            Public demo deployments may use demo-local provider mode. DeepSeek, Qwen, and OpenAI-compatible providers
            are ready when keys are configured.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-12 md:grid-cols-4">
        {outcomes.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-md border border-border bg-card p-5">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </article>
          );
        })}
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <Badge tone="muted">China-market signal</Badge>
            <h2 className="mt-4 text-3xl font-semibold">中文简介</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Built for China-market AI SaaS and 大模型应用开发 roles, while keeping the public demo honest and cost-safe.
            </p>
          </div>
          <div>
            <p className="text-base leading-8 text-foreground">
              SmartDocs AI 是一个面向团队的安全文档智能平台，支持文档上传、引用来源问答、工作空间权限、积分扣费和用量日志。公开演示环境可能使用
              demo-local 模式以保证稳定和成本可控；配置 DeepSeek / Qwen / OpenAI-compatible 密钥后可接入真实模型。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/technical-review"
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
              >
                Open technical review
              </Link>
              <a
                href="https://github.com/Shifu710/smartdocs-ai"
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
              >
                View GitHub
              </a>
              <a
                href="https://github.com/Shifu710/smartdocs-ai/blob/master/README.zh-CN.md"
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
              >
                Read README.zh-CN
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Badge tone="muted">Product workflow</Badge>
            <h2 className="mt-4 text-3xl font-semibold">From document upload to governed AI answer.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              SmartDocs AI combines document processing, hybrid retrieval, citations, usage tracking, and role-aware
              workspaces into one product flow for internal knowledge teams.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {workflow.map((step) => (
                <div key={step} className="rounded-md border border-border bg-background p-3 text-center text-sm font-medium">
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-border bg-background">
            <Image
              src="/marketing/rag-chat-citations.png"
              alt="SmartDocs AI cited RAG chat screenshot"
              width={1440}
              height={4134}
              className="h-[460px] w-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
        <div>
          <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">Built around workspace boundaries</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Retrieval, documents, members, credits, and settings are scoped to the active workspace.
          </p>
        </div>
        <div>
          <Users className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">Designed for owners and reviewers</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Owner flows support upload and workspace management. Guest demo access is intentionally limited.
          </p>
        </div>
        <div>
          <LockKeyhole className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">Honest demo architecture</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            ModelGateway, EmbeddingGateway, LangGraph, pgvector retrieval, citations, credits, and logs remain visible.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <FileSearch className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-2xl font-semibold">Evaluate the product surface in the live demo.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              HR and technical reviewers can still access the technical review page from the footer.
            </p>
          </div>
          <Link
            href="/demo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start demo
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
