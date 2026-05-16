"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText, Plus, Search, Sparkles, X, Edit3, Trash2, BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrg } from "@/lib/org-context";

type Category = "INFOSEC" | "ACCEPTABLE_USE" | "DATA_RETENTION" | "INCIDENT_RESPONSE"
  | "ACCESS_CONTROL" | "BUSINESS_CONTINUITY" | "CHANGE_MANAGEMENT" | "THIRD_PARTY" | "PRIVACY" | "OTHER";
type Status   = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface Policy {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  currentVersion: number;
  status: Status;
  ownerId: string | null;
  ownerName: string | null;
  nextReviewDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LABELS: Record<Category, string> = {
  INFOSEC:             "Information Security",
  ACCEPTABLE_USE:      "Acceptable Use",
  DATA_RETENTION:      "Data Retention",
  INCIDENT_RESPONSE:   "Incident Response",
  ACCESS_CONTROL:      "Access Control",
  BUSINESS_CONTINUITY: "Business Continuity",
  CHANGE_MANAGEMENT:   "Change Management",
  THIRD_PARTY:         "Third-Party Risk",
  PRIVACY:             "Privacy",
  OTHER:               "Other",
};

const STATUS_COLORS: Record<Status, string> = {
  DRAFT:     "bg-amber-50 text-amber-700 border-amber-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVED:  "bg-slate-50 text-slate-700 border-slate-200",
};

// Built-in policy templates seeded into the editor. The category drives which one is offered.
const TEMPLATES: Record<Category, string> = {
  INFOSEC: `# Information Security Policy

## Purpose
This policy establishes our commitment to protecting information assets.

## Scope
Applies to all employees, contractors, and third parties with access to our systems.

## Roles & Responsibilities
- **Information Security Officer:** Owns this policy.
- **All staff:** Must complete annual security training.

## Policy Statements
1. Access to information is granted on a need-to-know basis.
2. All systems must enforce multi-factor authentication.
3. Security incidents must be reported within 1 hour of detection.

## Review
Reviewed annually or after any major incident.`,
  ACCEPTABLE_USE: `# Acceptable Use Policy

## Purpose
Define acceptable use of company systems and data.

## Scope
All employees and contractors.

## Policy Statements
1. Company systems are for business use only; limited personal use is permitted.
2. Do not install unauthorised software.
3. Do not share credentials.
4. Report lost devices immediately.

## Violations
May result in disciplinary action up to and including termination.`,
  DATA_RETENTION: `# Data Retention Policy

## Purpose
Define how long different types of data are retained.

## Retention Periods
| Data type | Retention | Disposal method |
|---|---|---|
| Customer records | 7 years | Secure deletion |
| Audit logs | 1 year (Pro), 3 years (Enterprise) | Archive then deletion |
| Email | 3 years | Secure deletion |

## Review
Reviewed annually.`,
  INCIDENT_RESPONSE: `# Incident Response Plan

## Detection
Sources: SIEM alerts, employee reports, customer complaints.

## Response Steps
1. **Contain** — isolate affected systems.
2. **Eradicate** — remove the threat.
3. **Recover** — restore from clean backups.
4. **Lessons learned** — document and update controls.

## Communication
- Internal: notify the CISO within 1 hour.
- External: notify affected customers within 72 hours (GDPR).`,
  ACCESS_CONTROL: `# Access Control Policy

## Principle
Least privilege — staff have only the access they need.

## Joiners / Movers / Leavers
- **Joiners:** access provisioned by IT within 1 business day of start.
- **Movers:** access reviewed within 5 days of role change.
- **Leavers:** all access revoked on last working day.

## Reviews
Access reviews conducted quarterly.`,
  BUSINESS_CONTINUITY: `# Business Continuity Plan

## Critical Processes
List the processes that must keep running.

## Recovery Targets
- **RTO:** 4 hours
- **RPO:** 1 hour

## Test Schedule
Tabletop annually; full failover test every 2 years.`,
  CHANGE_MANAGEMENT: `# Change Management Policy

## Scope
All production changes (code, infrastructure, configuration).

## Process
1. Change request submitted with rollback plan.
2. Peer-reviewed.
3. Approved by change board for high-risk changes.
4. Tested in staging.
5. Deployed with monitoring.`,
  THIRD_PARTY: `# Third-Party Risk Management Policy

## Scope
Any vendor handling our data or providing critical services.

## Onboarding
- Security review completed before signing.
- DPA signed (if EU data).
- SOC 2 / ISO 27001 reviewed annually.

## Review
Risk-based: critical vendors annually, medium every 2 years.`,
  PRIVACY: `# Privacy Policy

## Purpose
How we collect, use, and protect personal data.

## Data Subject Rights
- Access
- Rectification
- Erasure
- Portability
- Object

## Contact
privacy@yourcompany.com — responses within 30 days.`,
  OTHER: `# Policy

## Purpose


## Scope


## Policy Statements


## Review
`,
};

function StarterUpsell() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Policy Library</h1>
        <p className="text-sm text-muted-foreground">Maintain your security & compliance policies in one place.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="size-4 text-blue-500" /> Available on Professional and Enterprise
          </CardTitle>
          <CardDescription>
            ISO 27001 §A.5.1 requires documented information security policies. Use built-in templates (Infosec,
            Acceptable Use, Access Control, Incident Response, etc.), version each change, and keep policies
            on a review cycle. Professional: up to 50 policies. Enterprise: unlimited.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings?tab=billing"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-9 px-4">
            View upgrade options
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function PolicyModal({ existing, onClose, onSaved }: {
  existing: Policy | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle]                 = useState(existing?.title ?? "");
  const [description, setDescription]     = useState(existing?.description ?? "");
  const [category, setCategory]           = useState<Category>(existing?.category ?? "INFOSEC");
  const [status, setStatus]               = useState<Status>(existing?.status ?? "DRAFT");
  const [nextReviewDate, setNextReviewDate] = useState(existing?.nextReviewDate ? existing.nextReviewDate.slice(0, 10) : "");
  const [content, setContent]             = useState<string>("");
  const [changeNotes, setChangeNotes]     = useState("");
  const [editContent, setEditContent]     = useState(!existing); // for new: edit; for existing: hidden by default
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  // Load existing content when editing. Run once per `existing` instance — switching
  // the category dropdown must NOT overwrite the user's typed content; for that they
  // press the explicit "Apply template" button below.
  useEffect(() => {
    if (!existing) {
      setContent(TEMPLATES[category] ?? "");
      return;
    }
    fetch(`/api/policies/${existing.id}`)
      .then((r) => r.json())
      .then((d) => {
        const latest = d?.policy?.versions?.[0];
        if (latest) setContent(latest.content);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  function applyTemplate() {
    setContent(TEMPLATES[category] ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("Title is required."); return; }
    if (!existing && !content.trim()) { setError("Policy content is required."); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        status,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate).toISOString() : undefined,
      };
      if (!existing) {
        // POST: content is required for v1
        body.content = content;
      } else if (editContent && content.trim()) {
        // PATCH with new content publishes a new version
        body.content = content;
        body.changeNotes = changeNotes.trim() || undefined;
      }
      const res = await fetch(existing ? `/api/policies/${existing.id}` : "/api/policies", {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">
            {existing ? `Edit policy — v${existing.currentVersion}` : "New policy"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          <div className="space-y-1.5">
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Information Security Policy" />
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
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="One-line summary shown in the list view" />
          </div>
          <div className="space-y-1.5">
            <Label>Next review date</Label>
            <Input type="date" value={nextReviewDate} onChange={(e) => setNextReviewDate(e.target.value)} />
          </div>

          {existing ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Policy content (markdown)</Label>
                <Button type="button" variant="outline" size="sm"
                  onClick={() => setEditContent((x) => !x)}>
                  {editContent ? "Cancel new version" : "Publish new version"}
                </Button>
              </div>
              {editContent && (
                <>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14}
                    className="w-full text-xs font-mono border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
                  <Input value={changeNotes} onChange={(e) => setChangeNotes(e.target.value)}
                    placeholder="What changed in this version?" />
                </>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Policy content (markdown) <span className="text-red-500">*</span></Label>
                <Button type="button" variant="outline" size="sm" onClick={applyTemplate}>
                  <BookOpen className="size-3.5 mr-1.5" /> Apply template
                </Button>
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14}
                className="w-full text-xs font-mono border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>
          )}
        </form>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : existing ? "Save changes" : "Create policy"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PoliciesPage() {
  const org = useOrg();
  const isPro = org?.plan === "professional" || org?.plan === "enterprise";

  const [policies, setPolicies]    = useState<Policy[]>([]);
  const [loading, setLoading]      = useState(true);
  const [showModal, setShowModal]  = useState(false);
  const [editing, setEditing]      = useState<Policy | null>(null);
  const [search, setSearch]        = useState("");
  const [statusFilter, setStatus]  = useState<"all" | Status>("all");

  function load() {
    setLoading(true);
    fetch("/api/policies")
      .then((r) => r.json())
      .then((d) => setPolicies(d.policies ?? []))
      .catch(() => setPolicies([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (org && isPro) load();
    else if (org) setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.plan]);

  const filtered = useMemo(() => {
    let out = policies;
    if (statusFilter !== "all") out = out.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      out = out.filter((p) =>
        p.title.toLowerCase().includes(s) ||
        (p.description ?? "").toLowerCase().includes(s),
      );
    }
    return out;
  }, [policies, search, statusFilter]);

  if (!org) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!isPro) return <StarterUpsell />;

  async function deletePolicy(id: string) {
    if (!confirm("Delete this policy and all its versions? This action cannot be undone.")) return;
    const res = await fetch(`/api/policies/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Policy Library</h1>
          <p className="text-sm text-muted-foreground">Document and version your security & compliance policies (ISO 27001 §A.5.1).</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus className="size-4 mr-1.5" /> New policy
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm">{filtered.length} polic{filtered.length === 1 ? "y" : "ies"}</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-8 h-8 w-56 text-xs" placeholder="Search…"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatus(e.target.value as "all" | Status)}
                className="h-8 text-xs border border-border rounded-lg px-2 bg-background">
                <option value="all">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {policies.length === 0
                ? "No policies yet. Click \"New policy\" and use the built-in templates to get started fast."
                : "No policies match your filters."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="py-2 font-medium">Title</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 font-medium">Version</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Next review</th>
                    <th className="py-2 font-medium w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const reviewSoon = p.nextReviewDate
                      ? new Date(p.nextReviewDate).getTime() - Date.now() < 30 * 86_400_000
                      : false;
                    return (
                      <tr key={p.id} className="border-b border-border hover:bg-muted/40">
                        <td className="py-3 pr-3">
                          <p className="font-medium text-foreground">{p.title}</p>
                          {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                        </td>
                        <td className="py-3 pr-3 text-xs text-muted-foreground">{CATEGORY_LABELS[p.category]}</td>
                        <td className="py-3 pr-3 text-xs font-mono">v{p.currentVersion}</td>
                        <td className="py-3 pr-3">
                          <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${STATUS_COLORS[p.status]}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-xs">
                          {p.nextReviewDate ? (
                            <span className={reviewSoon ? "text-amber-700 font-semibold" : "text-muted-foreground"}>
                              {new Date(p.nextReviewDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => { setEditing(p); setShowModal(true); }}
                              className="text-muted-foreground hover:text-foreground p-1">
                              <Edit3 className="size-3.5" />
                            </button>
                            <button onClick={() => deletePolicy(p.id)}
                              className="text-muted-foreground hover:text-red-600 p-1">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <PolicyModal
          existing={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={load}
        />
      )}
    </div>
  );
}
