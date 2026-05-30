"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck2,
  MessageSquare,
  Plus,
  User,
  Activity,
  ListTodo,
  PartyPopper,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrg } from "@/lib/org-context";

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivityEvent = {
  id: string;
  type: string;
  title: string;
  who: string;
  when: string;
  standard: string;
  control: string;
};

type TaskEvent = {
  id: string;
  title: string;
  standard: string;
  dueDate: string | null;
  priority: string;
  assigneeName: string;
  status: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 70) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function scoreTextColor(score: number) {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

const statusColors: Record<string, string> = {
  "In Progress":    "bg-blue-100 text-blue-700",
  "On Track":       "bg-green-100 text-green-700",
  "Needs Attention":"bg-amber-100 text-amber-700",
  "Certified":      "bg-emerald-100 text-emerald-700",
  "Starting":       "bg-purple-100 text-purple-700",
};

const priorityColors: Record<string, string> = {
  HIGH:     "bg-red-100 text-red-700",
  MEDIUM:   "bg-amber-100 text-amber-700",
  LOW:      "bg-slate-100 text-slate-600",
  CRITICAL: "bg-red-200 text-red-800",
};

function isOverdue(dueDate: string) {
  try { return new Date(dueDate) < new Date(); } catch { return false; }
}

const activityIconMap: Record<string, { icon: React.ElementType; cls: string }> = {
  evidence: { icon: FileCheck2,    cls: "text-blue-600 bg-blue-50"   },
  task:     { icon: Clock,         cls: "text-amber-600 bg-amber-50" },
  comment:  { icon: MessageSquare, cls: "text-purple-600 bg-purple-50"},
  alert:    { icon: AlertTriangle, cls: "text-red-600 bg-red-50"     },
  status:   { icon: CheckCircle2,  cls: "text-green-600 bg-green-50" },
};

// ── SVG Charts ────────────────────────────────────────────────────────────────

function DonutChart({ score, size = 96, stroke = 10 }: { score: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? "#10b981" : score >= 70 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

function MiniBarChart({ scores }: { scores: { label: string; value: number; color: string }[] }) {
  const max = 100;
  return (
    <div className="space-y-2">
      {scores.map((s) => (
        <div key={s.label} className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-20 shrink-0 truncate">{s.label.replace(/:.*/, "")}</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(s.value / max) * 100}%`, backgroundColor: s.color }} />
          </div>
          <span className="text-[10px] font-bold w-8 text-right shrink-0" style={{ color: s.color }}>{s.value}%</span>
        </div>
      ))}
    </div>
  );
}

function ControlStatusDonut({ implemented, inProgress, notStarted, nonCompliant, total, size = 80 }:
  { implemented: number; inProgress: number; notStarted: number; nonCompliant: number; total: number; size?: number }) {
  // Simple SVG pie using stroke-dasharray trick
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;

  const segments = [
    { value: implemented,  color: "#10b981" },
    { value: inProgress,   color: "#3b82f6" },
    { value: notStarted,   color: "#94a3b8" },
    { value: nonCompliant, color: "#ef4444" },
  ];

  let cumulativeOffset = 0;
  const circles = segments.map((seg, i) => {
    const pct = total > 0 ? seg.value / total : 0;
    const dash = pct * c;
    const gap = c - dash;
    const offset = -cumulativeOffset * c;
    cumulativeOffset += pct;
    return (
      <circle key={i}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={seg.color}
        strokeWidth={7}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    );
  });

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={7} />
      {circles}
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const GETTING_STARTED = [
  { label: "Add your first ISO standard", href: "/standards", done: false },
  { label: "Create a compliance project",  href: "/projects",  done: false },
  { label: "Upload your first evidence",   href: "/evidence",  done: false },
  { label: "Invite a team member",         href: "/team",      done: false },
  { label: "Run a gap analysis",           href: "/reports",   done: false },
];

function WelcomeBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 relative">
      <button onClick={onDismiss} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
        <X className="size-4" />
      </button>
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <PartyPopper className="size-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-base">Welcome to ISOComply!</h2>
          <p className="text-sm text-slate-600">Your workspace is ready. Here&apos;s how to get started:</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {GETTING_STARTED.map((item, i) => (
          <Link key={item.label} href={item.href}
            className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all px-3 py-2.5 group">
            <div className="size-5 rounded-full border-2 border-blue-300 group-hover:border-blue-500 flex items-center justify-center shrink-0 text-[10px] font-bold text-blue-400 group-hover:text-blue-600">
              {i + 1}
            </div>
            <span className="text-xs font-medium text-slate-700 group-hover:text-blue-700 leading-snug">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

type ProjectStats = {
  id: string;
  standardCode: string;
  standardName: string;
  name: string;
  score: number;
  implemented: number;
  inProgress: number;
  total: number;
  status: string;
};

export default function DashboardPage() {
  const [showWelcome,  setShowWelcome]  = useState(false);
  const [projects,     setProjects]     = useState<ProjectStats[]>([]);
  const [openTasks,    setOpenTasks]    = useState<TaskEvent[]>([]);
  const [activity,     setActivity]     = useState<ActivityEvent[]>([]);
  const [taskCount,    setTaskCount]    = useState(0);
  const [evidenceCount,setEvidenceCount]= useState(0);
  const [loadingData,  setLoadingData]  = useState(true);
  const [dataError,    setDataError]    = useState(false);
  const org = useOrg();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("isocomply_new_user") === "1") {
      setShowWelcome(true);
      return;
    }
    if (org?.isNew && !localStorage.getItem("dismissed_welcome")) {
      setShowWelcome(true);
    }
  }, [org]);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/activity").then((r) => r.json()),
      fetch("/api/evidence").then((r) => r.json()),
    ]).then(([projData, taskData, activityData, evidenceData]) => {
      setProjects(projData.projects ?? []);
      const allTasks: TaskEvent[] = taskData.tasks ?? [];
      const pending = allTasks.filter((t) => t.status !== "DONE");
      setOpenTasks(pending.slice(0, 7));
      setTaskCount(pending.length);
      setActivity((activityData.activity ?? []).slice(0, 5));
      setEvidenceCount((evidenceData.evidence ?? []).length);
      setLoadingData(false);
    }).catch(() => { setLoadingData(false); setDataError(true); });
  }, []);

  function dismissWelcome() {
    setShowWelcome(false);
    localStorage.removeItem("isocomply_new_user");
    localStorage.setItem("dismissed_welcome", "1");
  }

  // Use real project data or fall back to mock for demo if data exists
  const displayScores = projects.length > 0 ? projects : [];
  const hasData = projects.length > 0;

  const totalScore = hasData
    ? Math.round(displayScores.reduce((s, i) => s + i.score, 0) / displayScores.length)
    : 0;
  const totalImplemented = displayScores.reduce((s, i) => s + i.implemented, 0);
  const totalControls    = displayScores.reduce((s, i) => s + i.total, 0);
  const totalInProgress  = displayScores.reduce((s, i) => s + i.inProgress, 0);
  const totalNotStarted  = totalControls - totalImplemented - totalInProgress;

  return (
    <div className="space-y-6">
      {/* Welcome banner for first-time users */}
      {showWelcome && <WelcomeBanner onDismiss={dismissWelcome} />}

      {/* Empty state for new workspaces */}
      {!loadingData && !hasData && !showWelcome && (
        <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
          <div className="size-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="size-7 text-blue-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Your workspace is ready</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Start by creating a compliance project for one of the supported ISO standards.
          </p>
          <Link href="/projects">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="size-4 mr-1.5" />Create your first project
            </Button>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Compliance overview for {org?.name ?? "your organisation"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <TrendingUp className="size-4 mr-1.5" />View Gap Analysis
            </Button>
          </Link>
          <Link href="/projects">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="size-4 mr-1.5" />New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Top overview: donut + stats — only show when org has data */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="flex flex-col items-center justify-center py-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-4">Overall Compliance Score</p>
            <div className="relative">
              <DonutChart score={totalScore} size={120} stroke={12} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${scoreTextColor(totalScore)}`}>{totalScore}%</p>
                  <p className="text-[10px] text-muted-foreground">avg</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {[
                { label: "Controls met",   value: totalImplemented, color: "text-emerald-600" },
                { label: "Total controls", value: totalControls,    color: "text-foreground"  },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2 px-6 py-5 flex flex-col">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-4">Compliance by Standard</p>
            <div className="flex-1 flex flex-col justify-center">
              <MiniBarChart
                scores={displayScores.map((s) => ({
                  label: s.standardName,
                  value: s.score,
                  color: "#3b82f6",
                }))}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/tasks" className="block">
          <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Open Tasks</p>
              <p className="text-3xl font-bold text-foreground mt-1">{taskCount}</p>
              <p className="text-xs text-muted-foreground mt-1">across all projects</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/evidence" className="block">
          <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Evidence Files</p>
              <p className="text-3xl font-bold text-foreground mt-1">{evidenceCount}</p>
              <p className="text-xs text-muted-foreground mt-1">{evidenceCount === 0 ? "Upload evidence to track" : "evidence files"}</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="h-full">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Active Projects</p>
            <p className="text-3xl font-bold text-foreground mt-1">{projects.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{projects.length === 0 ? "Create a project to start" : "compliance projects"}</p>
          </CardContent>
        </Card>
        <Card className="h-full flex flex-col items-center justify-center py-3 gap-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Control Status</p>
          {hasData ? (
            <>
              <div className="relative">
                <ControlStatusDonut
                  implemented={totalImplemented}
                  inProgress={totalInProgress}
                  notStarted={totalNotStarted}
                  nonCompliant={0}
                  total={totalControls}
                  size={64}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {[
                  { label: "Done",   color: "bg-emerald-500", value: totalImplemented },
                  { label: "Active", color: "bg-blue-500",    value: totalInProgress  },
                  { label: "To do",  color: "bg-slate-300",   value: totalNotStarted  },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-1">
                    <div className={`size-1.5 rounded-full shrink-0 ${s.color}`} />
                    <span className="text-[9px] text-muted-foreground">{s.label} {s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center px-2">No controls yet — create a project first</p>
          )}
        </Card>
      </div>

      {/* Compliance by Standard — only show if there are projects */}
      {displayScores.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Standards — click to explore</h2>
            <Link href="/projects" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              All projects <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayScores.map((item) => (
              <Link key={item.id} href={`/projects?id=${item.id}`} className="block group">
                <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <DonutChart score={item.score} size={56} stroke={6} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-[10px] font-bold ${scoreTextColor(item.score)}`}>{item.score}%</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <p className="text-sm font-semibold text-foreground group-hover:text-blue-600 transition-colors leading-snug">
                            {item.standardName}
                          </p>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${statusColors[item.status] ?? "bg-slate-100 text-slate-700"}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{item.implemented}/{item.total} controls</p>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${scoreColor(item.score)} rounded-full transition-all duration-500`}
                            style={{ width: `${item.score}%` }} />
                        </div>
                        <div className="flex items-center justify-end mt-1.5">
                          <span className="text-[10px] text-blue-600 flex items-center gap-0.5 group-hover:underline">
                            Explore <ArrowRight className="size-2.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Activity & Tasks — only show when org has projects */}
      {hasData && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="size-4 text-blue-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates across all projects</CardDescription>
              </div>
              <Link href="/activity">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View all <ArrowRight className="size-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No activity yet — upload evidence or create tasks to see activity here.</p>
            ) : (
              <ul className="space-y-1">
                {activity.map((item) => {
                  const cfg = activityIconMap[item.type] ?? activityIconMap.task;
                  const Icon = cfg.icon;
                  return (
                    <li key={item.id}>
                      <Link href={`/activity?id=${item.id}`}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                        <span className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.cls}`}>
                          <Icon className="size-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.who} · {timeAgo(item.when)}</p>
                        </div>
                        <ArrowRight className="size-3.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Open Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <ListTodo className="size-4 text-amber-500" />
                  Open Tasks
                  {openTasks.filter((t) => t.dueDate && isOverdue(t.dueDate)).length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      <AlertTriangle className="size-2.5" />
                      {openTasks.filter((t) => t.dueDate && isOverdue(t.dueDate)).length} overdue
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Tasks due across all projects</CardDescription>
              </div>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View all <ArrowRight className="size-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {openTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No open tasks. Create tasks from the Tasks page.</p>
            ) : (
              <ul className="space-y-2">
                {openTasks.map((task) => {
                  const od = task.dueDate ? isOverdue(task.dueDate) : false;
                  const dueFmt = task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : "No due date";
                  return (
                    <li key={task.id}>
                      <Link href={`/tasks?id=${task.id}`}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer group ${
                          od
                            ? "border-red-200 bg-red-50/60 hover:bg-red-50 hover:border-red-300"
                            : "border-border hover:border-blue-200 hover:bg-muted/40"
                        }`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {od && <AlertTriangle className="size-3 text-red-500 shrink-0" />}
                            <p className={`text-sm font-medium leading-snug truncate transition-colors ${
                              od ? "text-red-800 group-hover:text-red-700" : "text-foreground group-hover:text-blue-600"
                            }`}>
                              {task.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">{task.standard}</Badge>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityColors[task.priority] ?? ""}`}>
                              {task.priority}
                            </span>
                            <span className={`text-xs flex items-center gap-1 font-medium ${od ? "text-red-600" : "text-muted-foreground"}`}>
                              <Clock className="size-3" />
                              {od ? `Overdue · ${dueFmt}` : dueFmt}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <User className="size-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{task.assigneeName ?? "Unassigned"}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Start New Project",  href: "/projects",  icon: Plus,        color: "text-blue-600"   },
              { label: "Invite Team Member", href: "/team",      icon: User,        color: "text-purple-600" },
              { label: "Run Gap Analysis",   href: "/reports",   icon: TrendingUp,  color: "text-amber-600"  },
              { label: "Upload Evidence",    href: "/evidence",  icon: FileCheck2,  color: "text-green-600"  },
            ].map((action) => (
              <Link key={action.label} href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-muted/40 hover:border-blue-200 transition-all text-center group">
                <action.icon className={`size-6 ${action.color} group-hover:scale-110 transition-transform`} />
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
