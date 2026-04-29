"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Mail, X, AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// ── Invite Modal ───────────────────────────────────────────────────────────────

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (member: Member) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [role,      setRole]      = useState("MEMBER");
  const [status,    setStatus]    = useState<"idle" | "loading" | "error">("idle");
  const [error,     setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role, firstName: firstName.trim(), lastName: lastName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to invite member.");
        setStatus("error");
        return;
      }
      onSuccess(data.member);
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <UserPlus className="size-4 text-blue-600" />Invite Team Member
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First name</Label>
              <Input
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input
                placeholder="Smith"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email address <span className="text-red-500">*</span></Label>
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">The person must already have an ISOComply account.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="VIEWER">Viewer — read-only access</option>
              <option value="MEMBER">Member — can create and edit content</option>
              <option value="ADMIN">Admin — full access, can invite members</option>
            </select>
          </div>

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="size-3.5 shrink-0" />{error}
            </p>
          )}

          <div className="flex gap-2.5 pt-1">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={status === "loading" || !email.trim()}
            >
              {status === "loading" ? "Inviting…" : "Send Invite"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const org = useOrg();
  const [members,      setMembers]      = useState<Member[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showInvite,   setShowInvite]   = useState(false);
  const [inviteSuccess,setInviteSuccess]= useState(false);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => { setMembers(data.members ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function handleInviteSuccess(member: Member) {
    setMembers((prev) => [...prev, member]);
    setShowInvite(false);
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 4000);
  }

  const canInvite = org?.role === "OWNER" || org?.role === "ADMIN";

  return (
    <>
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSuccess={handleInviteSuccess} />}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${members.length} member${members.length !== 1 ? "s" : ""} in ${org?.name ?? "your organisation"}`}
            </p>
          </div>
          {canInvite && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white self-start"
              size="sm"
              onClick={() => setShowInvite(true)}
            >
              <UserPlus className="size-4 mr-1.5" />Invite Member
            </Button>
          )}
        </div>

        {inviteSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            <Check className="size-4 shrink-0" />
            Member added successfully!
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4" />Members
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
                        <Mail className="size-3" />{member.email}
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
    </>
  );
}
