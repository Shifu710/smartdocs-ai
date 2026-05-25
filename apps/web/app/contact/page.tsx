import { Github, Mail, MessageCircle, MessageSquareText } from "lucide-react";
import Link from "next/link";

import { MarketingShell, PageIntro } from "@/components/marketing-shell";

export default function ContactPage() {
  return (
    <MarketingShell>
      <PageIntro
        eyebrow="Contact"
        title="Evaluate SmartDocs AI or review the implementation."
        description="This page keeps contact paths honest: no fake sales form, no simulated booking flow, and no placeholder payment journey."
      />

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-4">
        <div className="rounded-md border border-border bg-card p-6">
          <MessageCircle className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">China-market contact</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">WeChat: mgamal012</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            中国区联系：微信 mgamal012。适用于 HR 沟通、技术评审、项目合作或面试交流。
          </p>
        </div>
        <a href="mailto:mohamed.gamalj8@gmail.com" className="rounded-md border border-border bg-card p-6 hover:border-primary/50">
          <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">Email</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">mohamed.gamalj8@gmail.com</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Reach out about the SmartDocs AI portfolio project.</p>
        </a>
        <a href="https://github.com/Shifu710" className="rounded-md border border-border bg-card p-6 hover:border-primary/50">
          <Github className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">GitHub</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">github.com/Shifu710</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Review the repository, documentation, and issue history.</p>
        </a>
        <Link href="/technical-review" className="rounded-md border border-border bg-card p-6 hover:border-primary/50">
          <MessageSquareText className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-semibold">Technical review</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Open the HR and technical evaluator overview.</p>
        </Link>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Try the live product demo first.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Guest access opens the seeded review workspace. The demo may run with demo-local provider mode.
            </p>
          </div>
          <Link
            href="/demo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open demo
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
