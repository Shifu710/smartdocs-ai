"use client";

import { ShieldCheck, UserRound, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccessToken, getWorkspaceDashboard } from "@/lib/api";

const members = [
  { name: "Demo Owner", email: "demo@smartdocs.ai", role: "owner" },
  { name: "Guest Reviewer", email: "guest@smartdocs.ai", role: "viewer" },
  { name: "Platform Admin", email: "admin@smartdocs.ai", role: "owner" }
];

const permissions = [
  { action: "Ask questions", owner: true, admin: true, member: true, viewer: true },
  { action: "View citations", owner: true, admin: true, member: true, viewer: true },
  { action: "Upload documents", owner: true, admin: true, member: true, viewer: false },
  { action: "Re-index documents", owner: true, admin: true, member: false, viewer: false },
  { action: "Manage members", owner: true, admin: true, member: false, viewer: false },
  { action: "Change settings", owner: true, admin: true, member: false, viewer: false }
];

export default function MembersPage() {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
    }
  }, [router]);

  const dashboardQuery = useQuery({
    queryKey: ["workspace-dashboard", workspaceId],
    queryFn: () => getWorkspaceDashboard(workspaceId),
    enabled: Boolean(workspaceId) && Boolean(getAccessToken())
  });

  const role = dashboardQuery.data?.workspace.role;
  const canInvite = role === "owner" || role === "admin";

  return (
    <AppShell title="Members" workspaceId={workspaceId}>
      <div className="grid gap-5">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              Workspace members
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Review the seeded demo roles and permission boundaries.</p>
          </div>
          <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            {canInvite ? "Invites are disabled in the public demo." : "Guest demo is read-only. Invites are hidden for this role."}
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Seeded identities</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {members.map((member) => (
              <article key={member.email} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="font-medium">{member.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <Badge tone={member.role === "viewer" ? "muted" : "success"}>{member.role}</Badge>
              </article>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RBAC matrix</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 font-medium">Action</th>
                  <th className="py-3 font-medium">Owner</th>
                  <th className="py-3 font-medium">Admin</th>
                  <th className="py-3 font-medium">Member</th>
                  <th className="py-3 font-medium">Viewer</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.action} className="border-b border-border last:border-0">
                    <td className="py-3">{permission.action}</td>
                    {(["owner", "admin", "member", "viewer"] as const).map((permissionRole) => (
                      <td key={permissionRole} className="py-3">
                        {permission[permissionRole] ? (
                          <ShieldCheck className="h-4 w-4 text-green-600" aria-label="Allowed" />
                        ) : (
                          <span className="text-muted-foreground">Disabled</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
