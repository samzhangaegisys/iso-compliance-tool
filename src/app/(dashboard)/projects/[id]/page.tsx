"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  MinusCircle,
  Circle,
  ChevronDown,
  ChevronRight,
  FileText,
  Calendar,
  BarChart3,
  ListTodo,
  Paperclip,
  MessageSquare,
  AlertTriangle,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Types ─────────────────────────────────────────────────────────────────────

type ControlStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "IMPLEMENTED"
  | "NOT_APPLICABLE"
  | "NON_COMPLIANT";

interface RealControl {
  id: string;
  projectControlId: string | null;
  ref: string;
  title: string;
  description: string;
  status: ControlStatus;
  notes: string;
  evidenceCount: number;
  taskCount: number;
}

interface RealClause {
  number: string;
  title: string;
  controls: RealControl[];
}

interface ProjectData {
  id: string;
  name: string;
  description: string;
  standardCode: string;
  standardName: string;
  status: string;
  score: number;
  implemented: number;
  inProgress: number;
  notStarted: number;
  nonCompliant: number;
  total: number;
  targetDate: string | null;
  startDate: string | null;
  clauses: RealClause[];
}

interface ProjectTask {
  id: string;
  title: string;
  controlRef: string;
  assigneeName: string;
  dueDate: string | null;
  priority: string;
  status: string;
}

// ── Status map from DB task enum ──────────────────────────────────────────────

const DB_TASK_STATUS_LABEL: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

// ── SVG Charts ─────────────────────────────────────────────────────────────────

function DonutChart({ value, total, size = 72, stroke = 7, color = "#3b82f6" }: {
  value: number; total: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? value / total : 0;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${pct * c} ${(1 - pct) * c}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }} />
    </svg>
  );
}

function ClauseBarChart({ clauses }: { clauses: RealClause[] }) {
  return (
    <div className="space-y-2">
      {clauses.map((clause) => {
        const done = clause.controls.filter((c) => c.status === "IMPLEMENTED").length;
        const total = clause.controls.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const color = pct >= 90 ? "#10b981" : pct >= 70 ? "#3b82f6" : pct >= 40 ? "#f59e0b" : "#ef4444";
        return (
          <div key={clause.number} className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground w-8 shrink-0">{clause.number}</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <span className="text-[10px] font-bold w-8 text-right shrink-0" style={{ color }}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

const statusConfig: Record<
  ControlStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  NOT_STARTED:   { label: "Not Started",   icon: Circle,      className: "text-slate-500 bg-slate-100"  },
  IN_PROGRESS:   { label: "In Progress",   icon: Clock,       className: "text-blue-700 bg-blue-100"    },
  IMPLEMENTED:   { label: "Implemented",   icon: CheckCircle2,className: "text-green-700 bg-green-100"  },
  NOT_APPLICABLE:{ label: "N/A",           icon: MinusCircle, className: "text-slate-500 bg-slate-100"  },
  NON_COMPLIANT: { label: "Non-Compliant", icon: XCircle,     className: "text-red-700 bg-red-100"      },
};

type FilterTab = "all" | "NOT_STARTED" | "IN_PROGRESS" | "IMPLEMENTED" | "NON_COMPLIANT";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-5 bg-muted rounded w-48" />
      <div className="h-8 bg-muted rounded w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-48 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl lg:col-span-2" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = React.use(paramsPromise);
  const [mainTab, setMainTab] = useState<"overview" | "controls" | "tasks">("overview");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());
  const [project, setProject] = useState<ProjectData | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editingNotes, setEditingNotes] = useState<{ controlId: string; notes: string } | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${params.id}`).then((r) => r.json()),
      fetch(`/api/tasks?projectId=${params.id}`).then((r) => r.json()),
    ]).then(([projData, taskData]) => {
      if (!projData.project) { setNotFound(true); setLoading(false); return; }
      setProject(projData.project);
      setTasks(taskData.tasks ?? []);
      // Expand first two clauses by default
      const firstTwo = new Set<string>(
        (projData.project.clauses as RealClause[]).slice(0, 2).map((c) => c.number)
      );
      setExpandedClauses(firstTwo);
      setLoading(false);
    }).catch(() => { setNotFound(true); setLoading(false); });
  }, [params.id]);

  function toggleClause(number: string) {
    setExpandedClauses((prev) => {
      const next = new Set(prev);
      if (next.has(number)) next.delete(number);
      else next.add(number);
      return next;
    });
  }

  async function saveNotes(controlId: string, notes: string, currentStatus: string) {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ controlId, status: currentStatus, notes }),
      });
      if (!res.ok) throw new Error();
      // Update local state
      setProject((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          clauses: prev.clauses.map((clause) => ({
            ...clause,
            controls: clause.controls.map((c) =>
              c.id === controlId ? { ...c, notes } : c
            ),
          })),
        };
      });
      setEditingNotes(null);
    } catch {
      // silently fail — user can retry
    } finally {
      setSavingNotes(false);
    }
  }

  if (loading) return <Skeleton />;

  if (notFound || !project) {
    return (
      <div className="py-16 text-center">
        <AlertTriangle className="size-10 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">Project not found.</p>
        <Link href="/projects"><Button variant="outline" size="sm" className="mt-4">Back to Projects</Button></Link>
      </div>
    );
  }

  function filterControls(controls: RealControl[]): RealControl[] {
    if (activeTab === "all") return controls;
    return controls.filter((c) => c.status === activeTab);
  }

  const allControls = project.clauses.flatMap((c) => c.controls);
  const counts = {
    all: allControls.length,
    NOT_STARTED:  allControls.filter((c) => c.status === "NOT_STARTED").length,
    IN_PROGRESS:  allControls.filter((c) => c.status === "IN_PROGRESS").length,
    IMPLEMENTED:  allControls.filter((c) => c.status === "IMPLEMENTED").length,
    NON_COMPLIANT:allControls.filter((c) => c.status === "NON_COMPLIANT").length,
  };

  const openTasks = tasks.filter((t) => t.status !== "DONE");

  const scoreColor = project.score >= 90 ? "#10b981" : project.score >= 70 ? "#3b82f6" : project.score >= 40 ? "#f59e0b" : "#ef4444";

  const priorityColor: Record<string, string> = {
    CRITICAL: "text-red-700 bg-red-50",
    HIGH: "text-orange-700 bg-orange-50",
    MEDIUM: "text-amber-700 bg-amber-50",
    LOW: "text-slate-600 bg-slate-50",
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="size-3.5" />Projects
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {project.standardName} ·{" "}
            <span className="text-green-600 font-medium">{project.status}</span>
          </p>
          {project.description && <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" render={<Link href="/reports" />}>
            <BarChart3 className="size-4 mr-1.5" />Gap Report
          </Button>
        </div>
      </div>

      {/* Stats + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="flex flex-col items-center justify-center py-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">Compliance Score</p>
          <div className="relative">
            <DonutChart value={project.score} total={100} size={100} stroke={10} color={scoreColor} />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xl font-bold text-foreground">{project.score}%</p>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-center">
            <div>
              <p className="text-base font-bold text-emerald-600">{project.implemented}</p>
              <p className="text-[10px] text-muted-foreground">Implemented</p>
            </div>
            <div>
              <p className="text-base font-bold text-blue-600">{project.inProgress}</p>
              <p className="text-[10px] text-muted-foreground">In Progress</p>
            </div>
            <div>
              <p className="text-base font-bold text-slate-500">{project.notStarted}</p>
              <p className="text-[10px] text-muted-foreground">Not Started</p>
            </div>
          </div>
        </Card>

        <Card className="px-5 py-4 lg:col-span-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-4">Progress by Clause</p>
          <ClauseBarChart clauses={project.clauses} />
        </Card>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Total Controls</p>
          <p className="text-2xl font-bold text-foreground">{counts.all}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Non-Compliant</p>
          <p className="text-2xl font-bold text-red-600">{counts.NON_COMPLIANT}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Open Tasks</p>
          <p className="text-2xl font-bold text-amber-600">{openTasks.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Target Date</p>
          <p className="text-sm font-semibold text-foreground mt-1 flex items-center gap-1">
            <Calendar className="size-3.5 text-muted-foreground" />
            {project.targetDate ? new Date(project.targetDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Not set"}
          </p>
        </CardContent></Card>
      </div>

      {/* Main tabs */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as typeof mainTab)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="controls">Controls ({counts.all})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
        </TabsList>

        {/* ── Tasks tab ─────────────────────────────────────────────── */}
        <TabsContent value="tasks" className="mt-4">
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ListTodo className="size-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No tasks for this project yet.</p>
              <p className="text-xs mt-1 text-muted-foreground/70">Tasks are created via the Controls tab or the Tasks page.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_6rem_5rem_5rem_4rem] bg-muted px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                <span>Task</span><span>Assignee</span><span>Due</span><span>Priority</span><span>Status</span>
              </div>
              {tasks.map((t) => (
                <Link key={t.id} href={`/tasks`}
                  className="grid grid-cols-[1fr_6rem_5rem_5rem_4rem] px-4 py-2.5 border-t border-border hover:bg-muted/40 transition-colors items-center group">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-foreground group-hover:text-blue-600 transition-colors truncate">{t.title}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:flex">{t.controlRef}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{t.assigneeName}</span>
                  <span className="text-xs text-muted-foreground">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded w-fit ${priorityColor[t.priority] ?? ""}`}>{t.priority}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{DB_TASK_STATUS_LABEL[t.status] ?? t.status}</span>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Controls tab ──────────────────────────────────────────── */}
        <TabsContent value="controls" className="mt-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="NOT_STARTED">Not Started ({counts.NOT_STARTED})</TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">In Progress ({counts.IN_PROGRESS})</TabsTrigger>
              <TabsTrigger value="IMPLEMENTED">Implemented ({counts.IMPLEMENTED})</TabsTrigger>
              <TabsTrigger value="NON_COMPLIANT">Non-Compliant ({counts.NON_COMPLIANT})</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="space-y-4">
              {project.clauses.map((clause) => {
                const filtered = filterControls(clause.controls);
                if (filtered.length === 0) return null;
                const expanded = expandedClauses.has(clause.number);
                const clauseImplemented = clause.controls.filter((c) => c.status === "IMPLEMENTED").length;
                const clausePct = clause.controls.length > 0
                  ? Math.round((clauseImplemented / clause.controls.length) * 100) : 0;

                return (
                  <Card key={clause.number}>
                    <button onClick={() => toggleClause(clause.number)} className="w-full text-left">
                      <CardHeader className="pb-3 flex-row items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{clause.number}</span>
                            <CardTitle className="text-sm font-semibold">{clause.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 max-w-32">
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${clausePct}%` }} />
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{clauseImplemented}/{clause.controls.length} implemented</span>
                            <CardDescription className="text-xs">{clausePct}%</CardDescription>
                          </div>
                        </div>
                        {expanded
                          ? <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                          : <ChevronRight className="size-4 text-muted-foreground shrink-0" />}
                      </CardHeader>
                    </button>

                    {expanded && (
                      <CardContent className="pt-0">
                        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                          {filtered.map((control) => {
                            const conf = statusConfig[control.status] ?? statusConfig.NOT_STARTED;
                            return (
                              <div key={control.ref} className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors">
                                <span className={`size-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${conf.className}`}>
                                  <conf.icon className="size-3.5" />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-muted-foreground shrink-0">{control.ref}</span>
                                    <span className="text-sm text-foreground leading-snug">{control.title}</span>
                                  </div>

                                  {/* Notes display / edit */}
                                  {editingNotes?.controlId === control.id ? (
                                    <div className="mt-2 space-y-1.5">
                                      <textarea
                                        autoFocus
                                        rows={2}
                                        value={editingNotes.notes}
                                        onChange={(e) => setEditingNotes({ ...editingNotes, notes: e.target.value })}
                                        placeholder="Add notes or observations…"
                                        className="w-full text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                                      />
                                      <div className="flex gap-1.5">
                                        <button
                                          disabled={savingNotes}
                                          onClick={() => saveNotes(control.id, editingNotes.notes, control.status)}
                                          className="flex items-center gap-1 text-[10px] font-medium bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                          <Check className="size-2.5" />{savingNotes ? "Saving…" : "Save"}
                                        </button>
                                        <button
                                          onClick={() => setEditingNotes(null)}
                                          className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground px-2 py-1 rounded-md hover:bg-muted"
                                        >
                                          <X className="size-2.5" />Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 mt-1 group/notes">
                                      {control.notes
                                        ? <p className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex-1">{control.notes}</p>
                                        : null}
                                      <button
                                        onClick={() => setEditingNotes({ controlId: control.id, notes: control.notes })}
                                        className={`flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors ${control.notes ? "" : "opacity-0 group-hover/notes:opacity-100"}`}
                                      >
                                        <Pencil className="size-2.5" />{control.notes ? "Edit" : "Add note"}
                                      </button>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <FileText className="size-3" />{control.evidenceCount} evidence
                                    </span>
                                    {control.taskCount > 0 && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="size-3" />{control.taskCount} tasks
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Badge variant="outline" className={`shrink-0 text-xs ${conf.className} border-0`}>
                                  {conf.label}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ── Overview tab ──────────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.clauses.map((clause) => {
              const done   = clause.controls.filter((c) => c.status === "IMPLEMENTED").length;
              const inProg = clause.controls.filter((c) => c.status === "IN_PROGRESS").length;
              const nc     = clause.controls.filter((c) => c.status === "NON_COMPLIANT").length;
              const total  = clause.controls.length;
              const pct    = total > 0 ? Math.round((done / total) * 100) : 0;
              const color  = pct >= 90 ? "#10b981" : pct >= 70 ? "#3b82f6" : pct >= 40 ? "#f59e0b" : "#ef4444";
              return (
                <Card key={clause.number}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <DonutChart value={done} total={total} size={52} stroke={5} color={color} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-bold" style={{ color }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{clause.number}</span>
                          <span className="text-sm font-semibold text-foreground truncate">{clause.title}</span>
                        </div>
                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                          <span className="text-emerald-600">{done} done</span>
                          <span className="text-blue-600">{inProg} in progress</span>
                          {nc > 0 && <span className="text-red-600">{nc} non-compliant</span>}
                        </div>
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
