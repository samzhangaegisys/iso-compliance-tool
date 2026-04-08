"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrg } from "@/lib/org-context";

type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  joinedAt: string;
};

const roleColors: Record<string, string> = {
  OWNER:  "bg-blue-100 text-blue-700",
  ADMIN:  "bg-purple-100 text-purple-700",
  MEMBER: "bg-emerald-100 text-emerald-700",
  VIEWER: "bg-slate-100 text-slate-600",
};

const roleDescriptions: Record<string, string> = {
  OWNER:  "Created the workspace — full access",
  ADMIN:  "Full admin access, can invite/remove members",
  MEMBER: "Can create and edit compliance content",
  VIEWER: "Read-only access to all content",
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function TeamPage() {
  const org = useOrg();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => { setMembers(data.members ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${members.length} member${members.length !== 1 ? "s" : ""} in ${org?.name ?? "your organisation"}`}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white self-start" size="sm">
          <UserPlus className="size-4 mr-1.5" />
          Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="size-4" />
            Members
          </CardTitle>
          <CardDescription>Manage your organisation members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                  <div className="size-9 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-muted rounded w-32" />
                    <div className="h-2.5 bg-muted rounded w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="size-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">No team members yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Invite colleagues to collaborate on compliance</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 py-3">
                  <div className="size-9 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center shrink-0">
                    {initials(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="size-3" />
                      {member.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">{roleDescriptions[member.role] ?? ""}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColors[member.role] ?? "bg-slate-100 text-slate-600"}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
