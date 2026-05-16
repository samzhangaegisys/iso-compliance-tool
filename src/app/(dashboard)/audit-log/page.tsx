"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Sparkles, Download, Search, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrg } from "@/lib/org-context";

interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityId: string | null;
  meta: unknown;
  createdAt: string;
}

interface DistinctAction {
  action: string;
  count: number;
}

function actionLabel(action: string): string {
  // Friendlier display for common actions; falls back to the raw key.
  const map: Record<string, string> = {
    "ai.advisor_query": "AI Advisor query",
    "evidence.uploaded": "Evidence uploaded",
    "evidence.updated": "Evidence updated",
    "evidence.replaced": "Evidence file replaced",
    "risk.created": "Risk created",
    "risk.updated": "Risk updated",
    "risk.deleted": "Risk deleted",
    "team.member_invited": "Team member invited",
    "org.updated": "Organisation updated",
    "org.branding_updated": "Branding updated",
  };
  return map[action] ?? action;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AuditLogPage() {
  const org = useOrg();
  const isEnterprise = org?.plan === "enterprise";

  const [entries, setEntries]       = useState<AuditEntry[]>([]);
  const [actions, setActions]       = useState<DistinctAction[]>([]);
  const [loading, setLoading]       = useState(true);
  const [actionFilter, setActionF]  = useState<string>("");
  const [from, setFrom]             = useState<string>("");
  const [to, setTo]                 = useState<string>("");
  const [search, setSearch]         = useState<string>("");
  const [cursor, setCursor]         = useState<string | null>(null);
  const [hasMore, setHasMore]       = useState(false);

  const load = useCallback(async (resetCursor: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set("action", actionFilter);
      if (from) params.set("from", new Date(from).toISOString());
      if (to)   params.set("to", new Date(to).toISOString());
      if (!resetCursor && cursor) params.set("cursor", cursor);
      params.set("limit", "100");
      const res = await fetch(`/api/audit-log?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setEntries([]);
        setActions([]);
        return;
      }
      setActions(data.actions ?? []);
      setEntries((prev) => resetCursor ? data.entries : [...prev, ...data.entries]);
      setCursor(data.nextCursor ?? null);
      setHasMore(Boolean(data.nextCursor));
    } finally {
      setLoading(false);
    }
  }, [actionFilter, from, to, cursor]);

  useEffect(() => {
    if (org && isEnterprise) load(true);
    else if (org) setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.plan, actionFilter, from, to]);

  function exportCsv() {
    const rows = filtered.map((e) => ({
      timestamp: e.createdAt,
      user: e.userName,
      action: e.action,
      entityId: e.entityId ?? "",
      meta: e.meta ? JSON.stringify(e.meta) : "",
    }));
    const header = "timestamp,user,action,entityId,meta";
    const csv = [header, ...rows.map((r) =>
      [r.timestamp, r.user, r.action, r.entityId, r.meta].map((v) =>
        `"${String(v).replace(/"/g, '""')}"`,
      ).join(",")
    )].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = search.trim()
    ? entries.filter((e) =>
        e.userName.toLowerCase().includes(search.trim().toLowerCase()) ||
        actionLabel(e.action).toLowerCase().includes(search.trim().toLowerCase()) ||
        (e.entityId ?? "").toLowerCase().includes(search.trim().toLowerCase())
      )
    : entries;

  if (!org) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  if (!isEnterprise) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Full record of every action taken in your workspace.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="size-4 text-violet-500" /> Available on Enterprise
            </CardTitle>
            <CardDescription>
              The audit log records every administrative and security-relevant action — user logins, evidence
              changes, risk updates, plan upgrades, and more. ISO 27001 §A.8.15 requires logging of administrative
              activities, and most regulated industries (SOC 2, HIPAA, GDPR) expect retention and review.
              Enterprise customers get the full history, advanced filters, and CSV export.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/settings?tab=billing"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-9 px-4"
            >
              View upgrade options
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Every administrative and security-relevant action in your workspace.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="size-3.5 mr-1.5" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Action</Label>
              <select value={actionFilter} onChange={(e) => setActionF(e.target.value)}
                className="w-full h-9 text-sm border border-border rounded-lg px-2 bg-background">
                <option value="">All actions</option>
                {actions.map((a) => (
                  <option key={a.action} value={a.action}>{actionLabel(a.action)} ({a.count})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-8 h-9" placeholder="User, entity ID…" value={search}
                  onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="size-4" /> {filtered.length} entries shown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No audit entries match your filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="py-2 font-medium">When</th>
                    <th className="py-2 font-medium">User</th>
                    <th className="py-2 font-medium">Action</th>
                    <th className="py-2 font-medium">Entity</th>
                    <th className="py-2 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id} className="border-b border-border hover:bg-muted/40">
                      <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(e.createdAt)}
                      </td>
                      <td className="py-2 pr-3 text-xs">{e.userName}</td>
                      <td className="py-2 pr-3 text-xs font-medium">{actionLabel(e.action)}</td>
                      <td className="py-2 pr-3 text-[11px] text-muted-foreground font-mono">{e.entityId ?? "—"}</td>
                      <td className="py-2 pr-3 text-[11px] text-muted-foreground">
                        {e.meta ? (
                          <details>
                            <summary className="cursor-pointer flex items-center gap-1">
                              <ChevronDown className="size-3" /> meta
                            </summary>
                            <pre className="mt-1 bg-muted rounded p-2 text-[10px] overflow-x-auto max-w-md">
                              {JSON.stringify(e.meta, null, 2)}
                            </pre>
                          </details>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hasMore && (
                <div className="text-center py-4">
                  <Button variant="outline" size="sm" onClick={() => load(false)} disabled={loading}>
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
