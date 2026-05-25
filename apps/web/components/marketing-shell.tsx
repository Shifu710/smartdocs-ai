import { FileSearch, Github } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const productLinks = [
  { href: "/features", label: "Features" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/contact", label: "Contact" }
];

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-base font-semibold">
            <FileSearch className="h-5 w-5 text-primary" aria-hidden="true" />
            SmartDocs AI
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground lg:flex">
            {productLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">
              Sign in
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try demo
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <FileSearch className="h-5 w-5 text-primary" aria-hidden="true" />
              SmartDocs AI
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              A production-style Enterprise RAG SaaS demo for secure document intelligence. The public demo can run in
              demo-local provider mode when real model keys are not configured.
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">China contact: WeChat mgamal012</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Product</h2>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              {productLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              ))}
              <Link href="/demo" className="hover:text-foreground">
                Live demo
              </Link>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Reviewer links</h2>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <Link href="/technical-review" className="hover:text-foreground">
                Technical review
              </Link>
              <a href="https://github.com/Shifu710/smartdocs-ai" className="inline-flex items-center gap-2 hover:text-foreground">
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub repository
              </a>
              <a href="https://github.com/Shifu710" className="hover:text-foreground">
                GitHub profile
              </a>
              <Link href="/workspaces" className="hover:text-foreground">
                Workspace app
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-foreground md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
