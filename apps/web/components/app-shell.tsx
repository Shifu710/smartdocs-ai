"use client";

import { BarChart3, Building2, FileText, LogOut, MessageSquare, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { clearSession, getStoredUser } from "@/lib/api";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: BarChart3, segment: "dashboard" },
  { label: "Documents", icon: FileText, segment: "documents" },
  { label: "Chat", icon: MessageSquare, segment: "chat" },
  { label: "Usage", icon: BarChart3, segment: "usage" },
  { label: "Members", icon: Users, segment: "members" },
  { label: "Settings", icon: Settings, segment: "settings" }
];

export function AppShell({
  children,
  workspaceId,
  title
}: {
  children: ReactNode;
  workspaceId?: string;
  title: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card p-4 md:block">
        <Link href="/workspaces" className="flex items-center gap-2 text-base font-semibold">
          <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
          SmartDocs AI
        </Link>
        <nav className="mt-8 grid gap-1">
          {workspaceId
            ? navItems.map((item) => {
                const Icon = item.icon;
                const href = `/workspaces/${workspaceId}/${item.segment}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={item.segment}
                    href={href}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })
            : (
              <Link
                href="/workspaces"
                className="flex h-10 items-center gap-2 rounded-md bg-muted px-3 text-sm text-foreground"
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Workspaces
              </Link>
            )}
        </nav>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur md:px-6">
          <div>
            <p className="text-xs text-muted-foreground">{user?.email ?? "SmartDocs AI"}</p>
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
