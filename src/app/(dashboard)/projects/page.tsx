"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Calendar, ArrowRight, FolderOpen, CheckCircle2, Clock,
  PauseCircle, Archive, X, ChevronRight, ChevronDown, Target,
  ShieldCheck, FileCheck2, BarChart3, ListTodo, Search, Lightbulb,
  Building2, Code2, ClipboardList, TrendingUp, Users, BookOpen,
  AlertTriangle, Rocket, Check, LayoutGrid, GanttChart as GanttChartIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/lib/plan-context";
import { useOrg } from "@/lib/org-context";

// ── Types ─────────────────────────────────────────────────────────────────────

type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";

interface Project {
  id: string;
  name: string;
  description?: string;
  standard: string;
  standardCode: string;
  status: ProjectStatus;
  score: number;
  implemented: number;
  total: number;
  startDate: string;
  targetDate: string;
  lastUpdated: string;
  owner: string;
  phase: number; // 1–6
  nextAction: string;
}

// ── Standards catalogue (for new project modal) ────────────────────────────────

const STANDARDS_CATALOGUE = [
  {
    code: "ISO27001", name: "ISO/IEC 27001:2022", short: "Information Security",
    description: "Protect your data, manage cyber risk, and prove security to customers and partners. The most commonly required certification for enterprise contracts.",
    controls: 93, certTime: "6–12 months",
    industries: ["Technology", "Finance", "Healthcare", "Government"],
    color: "border-blue-400 bg-blue-50", badge: "bg-blue-600", icon: ShieldCheck,
    popular: true,
  },
  {
    code: "ISO9001", name: "ISO 9001:2015", short: "Quality Management",
    description: "Demonstrate consistent quality in your products and services. Reduces defects, improves customer satisfaction, and opens doors to new markets.",
    controls: 85, certTime: "4–9 months",
    industries: ["Manufacturing", "Construction", "Professional Services"],
    color: "border-green-400 bg-green-50", badge: "bg-green-600", icon: CheckCircle2,
    popular: false,
  },
  {
    code: "ISO14001", name: "ISO 14001:2015", short: "Environmental Management",
    description: "Manage your environmental impacts, reduce waste, and meet sustainability requirements from customers, investors, and regulators.",
    controls: 62, certTime: "4–8 months",
    industries: ["Manufacturing", "Construction", "Logistics", "Energy"],
    color: "border-emerald-400 bg-emerald-50", badge: "bg-emerald-600", icon: FileCheck2,
    popular: false,
  },
  {
    code: "ISO45001", name: "ISO 45001:2018", short: "Occupational Health & Safety",
    description: "Protect your people, reduce workplace incidents, and demonstrate duty of care. Often required for government and large enterprise contracts.",
    controls: 74, certTime: "4–9 months",
    industries: ["Construction", "Manufacturing", "Mining", "Healthcare"],
    color: "border-amber-400 bg-amber-50", badge: "bg-amber-600", icon: Target,
    popular: false,
  },
  {
    code: "ISO42001", name: "ISO/IEC 42001:2023", short: "AI Management",
    description: "The world's first AI management standard. Govern AI risk, bias, and transparency. Increasingly required for AI-enabled products and services.",
    controls: 58, certTime: "6–10 months",
    industries: ["Technology", "Finance", "Healthcare", "Legal"],
    color: "border-purple-400 bg-purple-50", badge: "bg-purple-600", icon: Lightbulb,
    popular: false,
  },
];

// ── Journey phases ─────────────────────────────────────────────────────────────

const JOURNEY_PHASES = [
  { n: 1, label: "Scope & Standard",    desc: "Define what's in scope and choose your ISO standard",       href: "/projects",  icon: BookOpen     },
  { n: 2, label: "Gap Analysis",        desc: "Identify where you are vs. where you need to be",            href: "/reports",   icon: Search       },
  { n: 3, label: "Remediation Plan",    desc: "Create tasks, assign owners, set deadlines",                 href: "/tasks",     icon: ListTodo     },
  { n: 4, label: "Implement & Collect", desc: "Implement controls and upload evidence",                     href: "/evidence",  icon: FileCheck2   },
  { n: 5, label: "Internal Audit",      desc: "Audit your own compliance before the certifier visits",      href: "/tasks",     icon: ClipboardList},
  { n: 6, label: "Certification",       desc: "Stage 1 & 2 external audit — get your certificate",         href: "/reports",   icon: CheckCircle2 },
];

// ── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<ProjectStatus, { label: string; icon: React.ElementType; cls: string; dot: string }> = {
  ACTIVE:    { label: "Active",    icon: Clock,        cls: "bg-blue-100 text-blue-700",    dot: "bg-blue-500"    },
  PAUSED:    { label: "Paused",    icon: PauseCircle,  cls: "bg-amber-100 text-amber-700",  dot: "bg-amber-400"   },
  COMPLETED: { label: "Certified", icon: CheckCircle2, cls: "bg-green-100 text-green-700",  dot: "bg-green-500"   },
  ARCHIVED:  { label: "Archived",  icon: Archive,      cls: "bg-slate-100 text-slate-600",  dot: "bg-slate-300"   },
};

const standardTheme: Record<string, { text: string; bg: string; bar: string; ring: string }> = {
  ISO27001: { text: "text-blue-700",    bg: "bg-blue-50",    bar: "#3b82f6", ring: "#3b82f6" },
  ISO9001:  { text: "text-green-700",   bg: "bg-green-50",   bar: "#22c55e", ring: "#22c55e" },
  ISO14001: { text: "text-emerald-700", bg: "bg-emerald-50", bar: "#10b981", ring: "#10b981" },
  ISO45001: { text: "text-amber-700",   bg: "bg-amber-50",   bar: "#f59e0b", ring: "#f59e0b" },
  ISO42001: { text: "text-purple-700",  bg: "bg-purple-50",  bar: "#a855f7", ring: "#a855f7" },
};

function scoreRingColor(score: number) {
  if (score >= 90) return "#10b981";
  if (score >= 70) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

function scoreTextColor(score: number) {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function daysUntil(iso: string) {
  const d = new Date(iso).getTime() - Date.now();
  const days = Math.ceil(d / 86400000);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, cls: "text-red-600" };
  if (days <= 30) return { label: `${days}d left`, cls: "text-amber-600" };
  if (days <= 90) return { label: `${days}d left`, cls: "text-blue-600" };
  return { label: `${days}d left`, cls: "text-slate-500" };
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return iso; }
}

// ── SVG Ring chart ────────────────────────────────────────────────────────────

function RingChart({ score, size = 64, stroke = 7, color }: { score: number; size?: number; stroke?: number; color: string }) {
  const r  = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const c  = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${(score / 100) * c} ${(1 - score / 100) * c}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }} />
    </svg>
  );
}

// ── Gantt colors ──────────────────────────────────────────────────────────────

const STD_COLORS: Record<string, string> = {
  ISO27001: "#3b82f6",
  ISO9001:  "#22c55e",
  ISO14001: "#10b981",
  ISO45001: "#f59e0b",
  ISO42001: "#a855f7",
};

// ── Gantt view ────────────────────────────────────────────────────────────────

function GanttView({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p className="text-sm">No projects to display</p>
      </div>
    );
  }

  const today = new Date();

  // Build date range: min startDate → max targetDate, minimum 6 months span
  const starts = projects.map((p) => new Date(p.startDate || today));
  const ends   = projects.map((p) =>
    p.targetDate && p.targetDate !== "Not set"
      ? new Date(p.targetDate)
      : new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
  );

  let minDate = new Date(Math.min(...starts.map((d) => d.getTime())));
  let maxDate = new Date(Math.max(...ends.map((d) => d.getTime())));

  // Snap to start of month / end of month
  minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

  // Ensure at least 6 months range
  const sixMonthsLater = new Date(minDate.getFullYear(), minDate.getMonth() + 6, 1);
  if (maxDate < sixMonthsLater) maxDate = sixMonthsLater;

  const totalMs = maxDate.getTime() - minDate.getTime();

  function pct(date: Date) {
    return Math.max(0, Math.min(100, ((date.getTime() - minDate.getTime()) / totalMs) * 100));
  }

  // Generate month labels
  const months: { label: string; left: number }[] = [];
  const cur = new Date(minDate);
  while (cur <= maxDate) {
    months.push({
      label: cur.toLocaleDateString("en-AU", { month: "short", year: "2-digit" }),
      left: pct(cur),
    });
    cur.setMonth(cur.getMonth() + 1);
  }

  const todayPct = pct(today);

  const ROW_HEIGHT = 52;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      <div className="overflow-x-auto">
        <div style={{ minWidth: 700 }}>
          {/* Month header */}
          <div className="relative h-8 border-b border-border bg-muted/40 ml-48">
            {months.map((m) => (
              <div key={m.label + m.left} className="absolute top-0 h-full flex items-center" style={{ left: `${m.left}%` }}>
                <div className="w-px h-full bg-border" />
                <span className="text-[10px] text-muted-foreground font-medium ml-1.5 whitespace-nowrap">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Project rows */}
          {projects.map((project, i) => {
            const start = new Date(project.startDate || today);
            const end   = project.targetDate && project.targetDate !== "Not set"
              ? new Date(project.targetDate)
              : new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

            const barLeft  = pct(start);
            const barRight = pct(end);
            const barWidth = Math.max(barRight - barLeft, 2);
            const color = STD_COLORS[project.standardCode] ?? "#64748b";

            return (
              <div key={project.id}
                className={`flex items-center border-b border-border ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                style={{ height: ROW_HEIGHT }}>
                {/* Label */}
                <div className="w-48 shrink-0 px-3 flex flex-col justify-center border-r border-border">
                  <p className="text-xs font-semibold text-foreground truncate">{project.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{project.standardCode}</p>
                </div>

                {/* Bar area */}
                <div className="flex-1 relative" style={{ height: ROW_HEIGHT }}>
                  {/* Today line */}
                  {todayPct >= 0 && todayPct <= 100 && (
                    <div className="absolute top-0 bottom-0 w-px bg-red-400/60 z-10" style={{ left: `${todayPct}%` }} />
                  )}

                  {/* Grid lines */}
                  {months.map((m) => (
                    <div key={m.label + m.left} className="absolute top-0 bottom-0 w-px bg-border/40" style={{ left: `${m.left}%` }} />
                  ))}

                  {/* Progress bar */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 rounded-full overflow-hidden"
                    style={{ left: `${barLeft}%`, width: `${barWidth}%`, height: 20 }}
                  >
                    {/* Background */}
                    <div className="absolute inset-0 rounded-full opacity-20" style={{ backgroundColor: color }} />
                    {/* Fill by score */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: color, width: `${project.score}%`, opacity: 0.85 }}
                    />
                    {/* Score label */}
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-[9px] font-bold text-white drop-shadow-sm whitespace-nowrap">
                        {project.score}%
                      </span>
                    </div>
                  </div>

                  {/* Target date marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full border-2 border-white shadow-sm z-10"
                    style={{ left: `${barRight}%`, backgroundColor: color, transform: "translate(-50%, -50%)" }}
                    title={`Target: ${project.targetDate}`}
                  />
                </div>

                {/* Score */}
                <div className="w-14 shrink-0 text-right pr-3">
                  <span className="text-xs font-bold" style={{ color }}>{project.score}%</span>
                </div>
              </div>
            );
          })}

          {/* Today legend */}
          <div className="flex items-center gap-4 px-3 py-2 bg-muted/20 border-t border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-px h-3 bg-red-400" />
              <span className="text-[10px] text-muted-foreground">Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-blue-400/30 border border-blue-400" />
              <span className="text-[10px] text-muted-foreground">Target date</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-8 rounded-full bg-blue-500" />
              <span className="text-[10px] text-muted-foreground">Progress (% compliant)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── New Project Modal ─────────────────────────────────────────────────────────

function NewProjectModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (p: unknown) => void;
}) {
  const org = useOrg();
  const { plan: adminPlan } = usePlan();
  const MOCK_PLAN = org?.plan ?? adminPlan;
  const [step, setStep]     = useState<1 | 2>(1);
  const [chosen, setChosen] = useState<string | null>(null);
  const [form, setForm]     = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().slice(0, 10),
    targetDate: "",
    leadUserId: "",
  });
  const [teamMembers, setTeamMembers] = useState<{ id: string; userId: string; name: string; email: string; role: string }[]>([]);
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState("");

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => setTeamMembers(data.members ?? []))
      .catch(() => {});
  }, []);

  const std = STANDARDS_CATALOGUE.find((s) => s.code === chosen);

  function setField<K extends keyof typeof form>(k: K, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function pickStandard(code: string) {
    setChosen(code);
    setForm((p) => ({ ...p, name: "" }));
    setStep(2);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    if (!chosen) return;
    if (!form.name.trim()) { setSaveError("Project name is required."); return; }
    if (!form.leadUserId) { setSaveError("Please select a project lead."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standardCode: chosen,
          name: form.name.trim(),
          description: form.description.trim() || null,
          startDate: form.startDate,
          targetDate: form.targetDate || null,
          leadUserId: form.leadUserId,
        }),
      });
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* non-JSON response */ }
      if (!res.ok || data.error) {
        setSaveError((data.error as string) || `Server error (${res.status}) — please try again.`);
      } else if (data.project) {
        onAdd(data.project);
      }
    } catch (err) {
      setSaveError("Network error — please check your connection and try again.");
      console.error("Project create error:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Rocket className="size-4 text-blue-600" /> New Compliance Project
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step {step} of 2 — {step === 1 ? "Choose your ISO standard" : "Project details"}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X className="size-4" />
          </button>
        </div>

        {/* Step 1: Choose standard */}
        {step === 1 && (
          <div className="p-6 overflow-y-auto max-h-[65vh]">
            {MOCK_PLAN === "starter" && (
              <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="size-3.5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  <strong>Starter plan:</strong> All 5 ISO standards are available — choose any. You can run up to 2 active projects in parallel.{" "}
                  <Link href="/settings?tab=billing" className="underline">Upgrade</Link> for unlimited projects.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STANDARDS_CATALOGUE.map((s) => {
                const Icon = s.icon;
                const selected = chosen === s.code;
                return (
                  <button key={s.code}
                    onClick={() => pickStandard(s.code)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : `${s.color} hover:border-current/50 hover:shadow-sm`
                    }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`size-7 rounded-lg ${s.badge} flex items-center justify-center`}>
                          <Icon className="size-3.5 text-white" />
                        </span>
                        {s.popular && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">Most popular</span>
                        )}
                      </div>
                      {selected && <Check className="size-4 text-blue-600 shrink-0" />}
                    </div>
                    <p className="text-xs font-bold text-foreground mb-0.5">{s.name}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">{s.short}</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{s.description}</p>
                    <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                      <span>{s.controls} controls</span>
                      <span>·</span>
                      <span>{s.certTime}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Project details */}
        {step === 2 && std && (
          <form onSubmit={submit} className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
            {/* Chosen standard chip */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
              <span className={`size-6 rounded-lg ${std.badge} flex items-center justify-center shrink-0`}>
                <std.icon className="size-3 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{std.name}</p>
                <p className="text-[10px] text-muted-foreground">{std.controls} controls · Avg. {std.certTime} to certify</p>
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline shrink-0">Change</button>
            </div>

            {/* Project name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Project name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={(e) => setField("name", e.target.value)} required autoFocus
                placeholder="e.g. ISO 27001 Certification 2027"
                className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-muted-foreground" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Start date <span className="text-red-500">*</span></label>
                <input type="date" value={form.startDate} onChange={(e) => setField("startDate", e.target.value)} required
                  className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Target certification date</label>
                <input type="date" value={form.targetDate} onChange={(e) => setField("targetDate", e.target.value)}
                  className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Project lead <span className="text-red-500">*</span></label>
              <select value={form.leadUserId} onChange={(e) => setField("leadUserId", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 cursor-pointer">
                <option value="">Select a team member…</option>
                {teamMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>{m.name}</option>
                ))}
              </select>
              {teamMembers.length === 0 && (
                <p className="text-[11px] text-amber-600">No team members found. You will be set as lead.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3}
                placeholder="e.g. All IT systems and personnel at Sydney HQ involved in customer data processing."
                className="w-full text-sm bg-muted border border-border rounded-lg px-3 py-2 outline-none focus:border-blue-400 placeholder:text-muted-foreground resize-none" />
            </div>

            {/* Error message */}
            {saveError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveError}</p>
            )}

            {/* Tip */}
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 flex gap-3">
              <Lightbulb className="size-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-800 mb-0.5">What happens next?</p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  After creating this project, we&rsquo;ll run a gap analysis so you can see exactly where you stand against every {std.short} requirement. That gives you a prioritised remediation list and estimated time to certification.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" size="sm" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {saving ? "Saving…" : <><Rocket className="size-3.5 mr-1.5" /> Create Project</>}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Journey progress bar ──────────────────────────────────────────────────────

function JourneyGuide({ projects }: { projects: Project[] }) {
  const [expanded, setExpanded] = useState(true);
  // Find the highest phase across all active projects
  const maxPhase = projects.filter((p) => p.status === "ACTIVE").reduce((m, p) => Math.max(m, p.phase), 1);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Rocket className="size-3.5 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">ISO Certification Journey</p>
            <p className="text-xs text-muted-foreground">Your 6-phase roadmap from gap analysis to certificate</p>
          </div>
        </div>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${expanded ? "" : "-rotate-90"}`} />
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          {/* Progress connector */}
          <div className="relative flex items-start gap-0 overflow-x-auto pb-1">
            {JOURNEY_PHASES.map((phase, i) => {
              const done    = phase.n < maxPhase;
              const current = phase.n === maxPhase;
              const Icon    = phase.icon;
              return (
                <div key={phase.n} className="flex flex-col items-center flex-1 min-w-[100px] relative">
                  {/* Connector line */}
                  {i < JOURNEY_PHASES.length - 1 && (
                    <div className={`absolute top-4 left-1/2 right-0 h-0.5 z-0 ${done ? "bg-blue-400" : "bg-muted"}`}
                      style={{ left: "50%", right: "-50%", width: "100%" }} />
                  )}
                  {/* Circle */}
                  <Link href={phase.href}
                    className={`relative z-10 size-8 rounded-full border-2 flex items-center justify-center transition-all mb-2 ${
                      done    ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                      : current ? "bg-white border-blue-500 text-blue-600 shadow-md shadow-blue-100 hover:bg-blue-50"
                      : "bg-background border-border text-muted-foreground hover:border-slate-300"
                    }`}>
                    {done
                      ? <Check className="size-3.5" />
                      : <Icon className="size-3.5" />}
                  </Link>
                  <p className={`text-[10px] font-semibold text-center leading-tight ${
                    done ? "text-blue-600" : current ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {phase.label}
                  </p>
                  {current && (
                    <span className="mt-1 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current phase detail */}
          {JOURNEY_PHASES[maxPhase - 1] && (
            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 flex items-start gap-3">
              <Lightbulb className="size-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-800">
                  Phase {maxPhase}: {JOURNEY_PHASES[maxPhase - 1].label}
                </p>
                <p className="text-[11px] text-blue-700 mt-0.5">{JOURNEY_PHASES[maxPhase - 1].desc}</p>
              </div>
              <Link href={JOURNEY_PHASES[maxPhase - 1].href}
                className="shrink-0 text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
                Go <ArrowRight className="size-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Role guide (shown to new users / first visit) ─────────────────────────────

function RoleGuide() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const roles = [
    {
      icon: Building2, color: "bg-blue-600", title: "Business Owner / CEO",
      steps: [
        "Create your first project and choose the ISO standard your customers are asking for",
        "Run a gap analysis — it takes ~15 minutes and shows you exactly what you need to fix",
        "Invite your team and assign tasks to the right people",
        "Track progress on the dashboard and generate reports for your board",
      ],
      tip: "Start with ISO 27001 — it's the most commonly required for enterprise contracts.",
    },
    {
      icon: Code2, color: "bg-emerald-600", title: "Security Engineer / IT Lead",
      steps: [
        "Create an ISO 27001 project and run the gap analysis against Annex A controls",
        "Focus on technical controls (A.7–A.8): access management, vulnerability management, cryptography",
        "Upload evidence for controls you've already implemented — this builds your score fast",
        "Create tasks for gaps and assign them to yourself or your team",
      ],
      tip: "Many technical controls are already partially met — evidence upload is your fastest win.",
    },
    {
      icon: ClipboardList, color: "bg-purple-600", title: "Compliance Manager / QA",
      steps: [
        "Set up all relevant ISO standards as separate projects with target certification dates",
        "Use the gap analysis to baseline your current compliance score",
        "Build the remediation task list and assign owners with due dates",
        "Monitor progress weekly on the dashboard and generate audit-ready reports",
      ],
      tip: "Use the evidence vault to centralise policies, procedures, and audit trails in one place.",
    },
  ];

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-200">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <Lightbulb className="size-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Where should I start?</p>
            <p className="text-xs text-amber-700">Pick your role for a tailored first-steps guide</p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700 transition-colors p-1">
          <X className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
        {roles.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.title} className="bg-white rounded-xl border border-amber-100 p-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`size-8 rounded-lg ${r.color} flex items-center justify-center shrink-0`}>
                  <Icon className="size-4 text-white" />
                </div>
                <p className="text-xs font-bold text-foreground">{r.title}</p>
              </div>
              <ol className="space-y-2 mb-3">
                {r.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="size-4 rounded-full bg-muted text-[9px] font-bold text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-snug">{s}</span>
                  </li>
                ))}
              </ol>
              <div className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-2">
                <p className="text-[10px] text-amber-800 leading-snug"><strong>Tip:</strong> {r.tip}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const theme  = standardTheme[project.standardCode] ?? standardTheme.ISO27001;
  const status = statusConfig[project.status];
  const due    = daysUntil(project.targetDate);
  const notStarted = project.total - project.implemented - Math.round(project.total * 0.1);

  return (
    <div className={`rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden group`}>
      {/* Top band */}
      <div className={`h-1 w-full`} style={{ backgroundColor: theme.ring }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`size-9 rounded-xl ${theme.bg} flex items-center justify-center shrink-0 mt-0.5`}>
              <FolderOpen className={`size-4 ${theme.text}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-blue-600 transition-colors truncate">
                {project.name}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{project.standard}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.cls}`}>
              <status.icon className="size-3" />{status.label}
            </span>
          </div>
        </div>

        {/* Score + controls */}
        <div className="flex items-center gap-4 mb-4">
          {/* Donut */}
          <div className="relative shrink-0">
            <RingChart score={project.score} size={64} stroke={7} color={scoreRingColor(project.score)} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-xs font-bold ${scoreTextColor(project.score)}`}>{project.score}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{project.implemented}/{project.total} controls</span>
              <span className={`font-semibold ${scoreTextColor(project.score)}`}>{project.score}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-0.5">
              <div className="h-full bg-emerald-500 rounded-l-full transition-all duration-700"
                style={{ width: `${(project.implemented / project.total) * 100}%` }} />
              <div className="h-full bg-blue-400 transition-all duration-700"
                style={{ width: `${(Math.round(project.total * 0.1) / project.total) * 100}%` }} />
            </div>
            <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500 inline-block" />{project.implemented} done</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-blue-400 inline-block" />{Math.round(project.total * 0.1)} active</span>
              <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-muted-foreground/30 inline-block" />{notStarted > 0 ? notStarted : 0} todo</span>
            </div>
          </div>
        </div>

        {/* Gap Analysis CTA — highlighted when never assessed */}
        {project.score === 0 && project.status === "ACTIVE" && (
          <Link href="/reports"
            className="flex items-center gap-2 rounded-xl border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-blue-50 px-3 py-2.5 mb-4 hover:border-violet-400 transition-all group/ai">
            <div className="size-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
              <BarChart3 className="size-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-violet-800">Run your Gap Analysis first</p>
              <p className="text-[10px] text-violet-600">See where you stand — takes ~15 mins</p>
            </div>
            <ArrowRight className="size-3.5 text-violet-500 group-hover/ai:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        )}

        {/* Next action (when not a fresh project) */}
        {project.status === "ACTIVE" && project.score > 0 && (
          <div className="rounded-lg bg-muted/50 border border-border px-3 py-2 mb-4 flex items-start gap-2">
            <ArrowRight className="size-3 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground leading-snug">
              <span className="font-semibold text-blue-600">Next: </span>{project.nextAction}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Calendar className="size-3" />
              <span>Target: {formatDate(project.targetDate)}</span>
              {project.status === "ACTIVE" && (
                <span className={`font-semibold ${due.cls}`}>({due.label})</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Users className="size-3" />
              <span>Lead: {project.owner}</span>
            </div>
          </div>
          <Link href={`/projects/${project.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors">
            Open <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
      <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
        <FolderOpen className="size-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">Create your first compliance project</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
        A project tracks all your work towards certifying a single ISO standard — gap analysis, tasks, evidence, and audit reports all in one place.
      </p>
      <button onClick={onNew}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
        <Plus className="size-4" /> Create your first project
      </button>
    </div>
  );
}

// ── Mapping helper ────────────────────────────────────────────────────────────

function mapApiProject(p: {
  id: string; name: string; description?: string; standardCode: string; standardName: string;
  status: string; score: number; implemented: number; total: number;
  targetDate: string | null; startDate: string | null; createdAt: string;
  leadUserId?: string | null;
}): Project {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    standard: p.standardName,
    standardCode: p.standardCode,
    status: p.status as Project["status"],
    score: p.score,
    implemented: p.implemented,
    total: p.total,
    startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    targetDate: p.targetDate ? new Date(p.targetDate).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "Not set",
    owner: "",
    lastUpdated: new Date(p.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }),
    phase: 1,
    nextAction: "",
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const org = useOrg();
  const { plan: adminPlan } = usePlan();
  const MOCK_PLAN = org?.plan ?? adminPlan;
  const [projects, setProjects]           = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [viewMode, setViewMode]           = useState<"cards" | "gantt">("cards");

  async function loadProjects() {
    setLoadingProjects(true);
    try {
      const res  = await fetch("/api/projects");
      const data = await res.json();
      setProjects((data.projects ?? []).map(mapApiProject));
    } catch {
      // silently keep whatever was loaded
    } finally {
      setLoadingProjects(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const active    = projects.filter((p) => p.status === "ACTIVE");
  const other     = projects.filter((p) => p.status !== "ACTIVE");
  const hasProjects = projects.length > 0;

  async function addProject(_p: unknown) {
    await loadProjects();
    setShowModal(false);
  }

  function handleNewProject() {
    setShowModal(true);
  }

  return (
    <>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onAdd={addProject} />}

      <div className="space-y-6 pb-10">
        {/* Starter plan banner — project-count gate */}
        {MOCK_PLAN === "starter" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">Starter plan · up to 2 active projects</p>
              <p className="text-xs text-amber-700 mt-0.5">
                All 5 ISO standards are available. Starter is limited to 2 active compliance projects in parallel. <Link href="/settings?tab=billing" className="underline hover:no-underline">Upgrade to Professional</Link> for unlimited projects, users, and AI Advisor queries.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compliance Projects</h1>
            <p className="text-sm text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? "s" : ""} · {active.length} active
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* View toggle */}
            {hasProjects && (
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button onClick={() => setViewMode("cards")}
                  className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${viewMode === "cards" ? "bg-blue-600 text-white" : "hover:bg-muted text-muted-foreground"}`}>
                  <LayoutGrid className="size-3.5" /> Cards
                </button>
                <button onClick={() => setViewMode("gantt")}
                  className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 border-l border-border transition-colors ${viewMode === "gantt" ? "bg-blue-600 text-white" : "hover:bg-muted text-muted-foreground"}`}>
                  <GanttChartIcon className="size-3.5" /> Gantt
                </button>
              </div>
            )}
            <button onClick={handleNewProject}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm bg-blue-600 hover:bg-blue-500 text-white">
              <Plus className="size-4" /> New Project
            </button>
          </div>
        </div>

        {/* Summary chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["ACTIVE","PAUSED","COMPLETED","ARCHIVED"] as ProjectStatus[]).map((s) => {
            const cfg   = statusConfig[s];
            const count = projects.filter((p) => p.status === s).length;
            return (
              <div key={s} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <span className={`size-8 rounded-lg flex items-center justify-center ${cfg.cls}`}>
                  <cfg.icon className="size-4" />
                </span>
                <div>
                  <p className="text-lg font-bold leading-none">{count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{cfg.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Certification journey guide */}
        {hasProjects && <JourneyGuide projects={projects} />}

        {/* Role-based getting started */}
        <RoleGuide />

        {/* Loading skeleton */}
        {loadingProjects && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="rounded-2xl border border-border bg-card p-5 space-y-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {!loadingProjects && (
          <>
            {!hasProjects ? (
              <EmptyState onNew={() => setShowModal(true)} />
            ) : (
              <>
                {viewMode === "gantt" && (
                  <GanttView projects={[...active, ...other]} />
                )}

                {viewMode === "cards" && (
                  <>
                    {active.length > 0 && (
                      <div>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-500 inline-block" /> Active Projects
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {active.map((p) => <ProjectCard key={p.id} project={p} />)}
                        </div>
                      </div>
                    )}

                    {other.length > 0 && (
                      <div>
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                          <span className="size-2 rounded-full bg-muted-foreground/40 inline-block" /> Other Projects
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {other.map((p) => <ProjectCard key={p.id} project={p} />)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
