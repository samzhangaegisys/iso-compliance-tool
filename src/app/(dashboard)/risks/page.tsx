"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, Plus, Search, Sparkles, ShieldAlert,
  ChevronDown, ChevronUp, X, Edit3, Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrg } from "@/lib/org-context";

// ── Types ─────────────────────────────────────────────────────────────────────

type Category  = "OPERATIONAL" | "SECURITY" | "COMPLIANCE" | "FINANCIAL" | "REPUTATIONAL" | "STRATEGIC" | "TECHNOLOGY";
type Treatment = "AVOID" | "MITIGATE" | "TRANSFER" | "ACCEPT";
type Status    = "OPEN" | "IN_TREATMENT" | "CLOSED" | "ACCEPTED";

interface Risk {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  likelihood: number;
  impact: number;
  score: number;
  treatment: Treatment;
  treatmentNotes: string | null;
  ownerId: string | null;
  ownerName: string | null;
  reviewDate: string | null;
  status: Status;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<Category, string> = {
  OPERATIONAL:   "Operational",
  SECURITY:      "Security",
  COMPLIANCE:    "Compliance",
  FINANCIAL:     "Financial",
  REPUTATIONAL:  "Reputational",
  STRATEGIC:     "Strategic",
  TECHNOLOGY:    "Technology",
};

const TREATMENT_LABELS: Record<Treatment, string> = {
  AVOID:    "Avoid",
  MITIGATE: "Mitigate",
  TRANSFER: "Transfer",
  ACCEPT:   "Accept",
};

const STATUS_LABELS: Record<Status, string> = {
  OPEN:          "Open",
  IN_TREATMENT:  "In treatment",
  CLOSED:        "Closed",
  ACCEPTED:      "Accepted",
};

const STATUS_COLORS: Record<Status, string> = {
  OPEN:          "bg-red-50 text-red-700 border-red-200",
  IN_TREATMENT:  "bg-amber-50 text-amber-700 border-amber-200",
  ACCEPTED:      "bg-slate-50 text-slate-700 border-slate-200",
  CLOSED:        "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function scoreColor(score: number): string {
  if (score >= 20) return "bg-red-600 text-white";
  if (score >= 12) return "bg-amber-500 text-white";
  if (score >= 6)  return "bg-yellow-400 text-slate-900";
  return "bg-emerald-500 text-white";
}

function scoreLabel(score: number): string {
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6)  return "Medium";
  return "Low";
}

// ── Empty state for Starter ───────────────────────────────────────────────────

function StarterUpsell() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Risk Register</h1>
        <p className="text-sm text-muted-foreground">Track risks, assess likelihood & impact, and assign treatments.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="size-4 text-blue-500" /> Available on Professional and Enterprise
          </CardTitle>
          <CardDescription>
            The risk register is required by ISO 27001 §6.1.2. Track risks against a 5×5 likelihood/impact matrix,
            assign owners, set review dates, and capture treatment plans.
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

// ── Risk modal (create/edit) ──────────────────────────────────────────────────

function RiskModal({ existing, onClose, onSaved }: {
  existing: Risk | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle]                   = useState(existing?.title ?? "");
  const [description, setDescription]       = useState(existing?.description ?? "");
  const [category, setCategory]             = useState<Category>(existing?.category ?? "OPERATIONAL");
  const [likelihood, setLikelihood]         = useState(existing?.likelihood ?? 3);
  const [impact, setImpact]                 = useState(existing?.impact ?? 3);
  const [treatment, setTreatment]           = useState<Treatment>(existing?.treatment ?? "MITIGATE");
  const [treatmentNotes, setTreatmentNotes] = useState(existing?.treatmentNotes ?? "");
  const [reviewDate, setReviewDate]         = useState(existing?.reviewDate ? existing.reviewDate.slice(0, 10) : "");
  const [status, setStatus]                 = useState<Status>(existing?.status ?? "OPEN");
  const [saving, setSaving]                 = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        likelihood,
        impact,
        treatment,
        treatmentNotes: treatmentNotes.trim() || undefined,
        reviewDate: reviewDate ? new Date(reviewDate).toISOString() : undefined,
        status,
      };
      const res = await fetch(existing ? `/api/risks/${existing.id}` : "/api/risks", {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed"); return; }
      onSaved();
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{existing ? "Edit risk" : "New risk"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          <div className="space-y-1.5">
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Loss of customer data due to ransomware" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the risk scenario, triggers, and potential consequences"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background">
                {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full text-sm border border-border rounded-lg px-2.5 py-1.5 bg-background">
                {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Likelihood (1–5)</Label>
              <input type="range" min={1} max={5} value={likelihood}
                onChange={(e) => setLikelihood(Number.parseInt(e.target.value, 10))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Rare</span><span className="font-semibold text-foreground">{likelihood}</span><span>Almost certain</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Impact (1–5)</Label>
              <input type="range" min={1} max={5} value={impact}
                onChange={(e) => setImpact(Number.parseInt(e.target.value, 10))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Negligible</span><span className="font-semibold text-foreground">{impact}</span><span>Severe</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center py-3">
            <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${scoreColor(likelihood * impact)}`}>
              Inherent score: {likelihood * impact} — {scoreLabel(likelihood * impact)}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Treatment</Label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(TREATMENT_LABELS) as Treatment[]).map((t) => (
                <button key={t} type="button"
                  onClick={() => setTreatment(t)}
                  className={`text-sm py-2 rounded-lg border ${
                    treatment === t
                      ? "bg-blue-50 border-blue-500 text-blue-700 font-semibold"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}>
                  {TREATMENT_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Treatment notes</Label>
            <textarea
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              rows={2}
              placeholder="What action will be taken to address this risk?"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Next review date</Label>
            <Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
        </form>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : existing ? "Save changes" : "Create risk"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

function Heatmap({ risks }: { risks: Risk[] }) {
  // 5x5 grid: rows = impact (high at top), cols = likelihood
  const grid: Risk[][][] = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => []));
  for (const r of risks) {
    if (r.status === "CLOSED" || r.status === "ACCEPTED") continue;
    const rowIdx = 5 - r.impact;       // impact 5 → row 0, impact 1 → row 4
    const colIdx = r.likelihood - 1;   // likelihood 1 → col 0
    grid[rowIdx]![colIdx]!.push(r);
  }
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Risk heatmap</CardTitle>
        <CardDescription className="text-xs">Open and in-treatment risks plotted by likelihood × impact.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[40px_repeat(5,1fr)] gap-1">
          <div />
          {[1, 2, 3, 4, 5].map((l) => (
            <div key={l} className="text-[10px] text-muted-foreground text-center">L{l}</div>
          ))}
          {grid.map((row, rIdx) => (
            <React.Fragment key={rIdx}>
              <div className="text-[10px] text-muted-foreground flex items-center justify-end pr-2">I{5 - rIdx}</div>
              {row.map((cell, cIdx) => {
                const score = (5 - rIdx) * (cIdx + 1);
                return (
                  <div key={cIdx}
                    className={`h-12 rounded text-xs flex items-center justify-center font-semibold ${scoreColor(score)} ${cell.length === 0 ? "opacity-30" : ""}`}
                    title={cell.map((r) => r.title).join("\n")}>
                    {cell.length || ""}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RisksPage() {
  const org = useOrg();
  const isPro = org?.plan === "professional" || org?.plan === "enterprise";

  const [risks, setRisks]           = useState<Risk[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<Risk | null>(null);
  const [statusFilter, setStatus]   = useState<"all" | Status>("all");
  const [search, setSearch]         = useState("");
  const [sortBy, setSortBy]         = useState<"score" | "createdAt">("score");
  const [sortDir, setSortDir]       = useState<"desc" | "asc">("desc");

  function load() {
    setLoading(true);
    fetch("/api/risks")
      .then((r) => r.json())
      .then((d) => setRisks(d.risks ?? []))
      .catch(() => setRisks([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (org && isPro) load();
    else if (org) setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.plan]);

  const filtered = useMemo(() => {
    let out = risks;
    if (statusFilter !== "all") out = out.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      out = out.filter((r) =>
        r.title.toLowerCase().includes(s) ||
        (r.description ?? "").toLowerCase().includes(s) ||
        (r.ownerName ?? "").toLowerCase().includes(s),
      );
    }
    return [...out].sort((a, b) => {
      const av = sortBy === "score" ? a.score : new Date(a.createdAt).getTime();
      const bv = sortBy === "score" ? b.score : new Date(b.createdAt).getTime();
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [risks, statusFilter, search, sortBy, sortDir]);

  if (!org) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!isPro) return <StarterUpsell />;

  async function deleteRisk(id: string) {
    if (!confirm("Delete this risk? This action cannot be undone.")) return;
    const res = await fetch(`/api/risks/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Risk Register</h1>
          <p className="text-sm text-muted-foreground">Required by ISO 27001 §6.1.2 — track risks, assess severity, and assign treatments.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus className="size-4 mr-1.5" /> New risk
        </Button>
      </div>

      {risks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="size-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="size-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {risks.filter((r) => r.score >= 20 && r.status !== "CLOSED" && r.status !== "ACCEPTED").length}
                </p>
                <p className="text-xs text-muted-foreground">Critical (open)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="size-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldAlert className="size-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {risks.filter((r) => r.status === "OPEN" || r.status === "IN_TREATMENT").length}
                </p>
                <p className="text-xs text-muted-foreground">Active risks</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <div className="size-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <AlertTriangle className="size-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {risks.filter((r) => r.status === "CLOSED" || r.status === "ACCEPTED").length}
                </p>
                <p className="text-xs text-muted-foreground">Closed / accepted</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {risks.length > 0 && <Heatmap risks={risks} />}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm">All risks ({filtered.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 w-48 text-xs"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatus(e.target.value as "all" | Status)}
                className="h-8 text-xs border border-border rounded-lg px-2 bg-background">
                <option value="all">All statuses</option>
                {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {risks.length === 0 ? "No risks yet. Click \"New risk\" to add your first." : "No risks match your filters."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="py-2 font-medium">Title</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 font-medium">
                      <button onClick={() => { setSortBy("score"); setSortDir(sortDir === "desc" ? "asc" : "desc"); }}
                        className="flex items-center gap-1 hover:text-foreground">
                        Score
                        {sortBy === "score" && (sortDir === "desc" ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />)}
                      </button>
                    </th>
                    <th className="py-2 font-medium">Treatment</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Owner</th>
                    <th className="py-2 font-medium w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border hover:bg-muted/40">
                      <td className="py-3 pr-3">
                        <p className="font-medium text-foreground">{r.title}</p>
                        {r.description && <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>}
                      </td>
                      <td className="py-3 pr-3 text-xs text-muted-foreground">{CATEGORY_LABELS[r.category]}</td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${scoreColor(r.score)}`}>
                          {r.score}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs">{TREATMENT_LABELS[r.treatment]}</td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${STATUS_COLORS[r.status]}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs text-muted-foreground">{r.ownerName ?? "—"}</td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => { setEditing(r); setShowModal(true); }}
                            className="text-muted-foreground hover:text-foreground p-1">
                            <Edit3 className="size-3.5" />
                          </button>
                          <button onClick={() => deleteRisk(r.id)}
                            className="text-muted-foreground hover:text-red-600 p-1">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <RiskModal
          existing={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={load}
        />
      )}
    </div>
  );
}
