"use client";

import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck2,
  Plus,
  User,
  Activity,
  ListTodo,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Data ─────────────────────────────────────────────────────────────────────

const complianceScores = [
  { standard: "ISO 27001:2022", code: "ISO27001", score: 68, implemented: 63, total: 93,  trend: "+5%", status: "In Progress",    href: "/projects/proj-1", barColor: "#3b82f6" },
  { standard: "ISO 9001:2015",  code: "ISO9001",  score: 84, implemented: 71, total: 85,  trend: "+2%", status: "On Track",        href: "/projects/proj-2", barColor: "#22c55e" },
  { standard: "ISO 14001:2015", code: "ISO14001", score: 42, implemented: 26, total: 62,  trend: "—",   status: "Needs Attention", href: "/projects/proj-3", barColor: "#f59e0b" },
  { standard: "ISO 45001:2018", code: "ISO45001", score: 91, implemented: 67, total: 74,  trend: "+8%", status: "Certified",       href: "/projects/proj-4", barColor: "#10b981" },
  { standard: "ISO 42001:2023", code: "ISO42001", score: 23, implemented: 13, total: 58,  trend: "New", status: "Starting",        href: "/projects/proj-5", barColor: "#a855f7" },
];

export const recentActivity = [
  { id: "1", type: "evidence", text: 'Evidence uploaded for "A.8.7 — Protection against malware"',    who: "Sarah K.",  when: "2 hours ago",   icon: "FileCheck2",    iconClass: "text-blue-600 bg-blue-50"  },
  { id: "2", type: "status",   text: '"5.2 Quality Policy" marked as Implemented',                     who: "James O.",  when: "4 hours ago",   icon: "CheckCircle2",  iconClass: "text-green-600 bg-green-50" },
  { id: "3", type: "task",     text: "New task: Review supplier agreements for ISO 9001 clause 8.4",   who: "Admin",     when: "Yesterday",     icon: "Clock",         iconClass: "text-amber-600 bg-amber-50" },
  { id: "4", type: "alert",    text: '"4.1 Understanding context" is overdue — 3 days past target',    who: "System",    when: "Yesterday",     icon: "AlertTriangle", iconClass: "text-red-600 bg-red-50"    },
  { id: "5", type: "evidence", text: 'Evidence uploaded for "8.2 Emergency preparedness"',             who: "Tom R.",    when: "2 days ago",    icon: "FileCheck2",    iconClass: "text-blue-600 bg-blue-50"  },
];

export const upcomingTasks = [
  { id: "9",  title: "Review supplier security assessments",     standard: "ISO 27001", dueDate: "Apr 2, 2026",  priority: "HIGH",     assignee: "Sarah K.",   description: "Review all third-party supplier security questionnaires and update the risk register.", status: "In Progress" },
  { id: "10", title: "Submit Q1 compliance evidence package",    standard: "ISO 9001",  dueDate: "Apr 4, 2026",  priority: "CRITICAL", assignee: "James O.",   description: "Compile and submit Q1 compliance evidence for management review.", status: "In Progress" },
  { id: "11", title: "Complete environmental context review",    standard: "ISO 14001", dueDate: "Mar 30, 2026", priority: "MEDIUM",   assignee: "Tom R.",     description: "Review and update the environmental context analysis document.", status: "Todo" },
  { id: "1",  title: "Complete risk assessment documentation",   standard: "ISO 27001", dueDate: "Apr 12, 2026", priority: "HIGH",     assignee: "Sarah K.",   description: "Review and finalise all risk assessment documentation.",  status: "In Progress" },
  { id: "2",  title: "Update environmental aspects register",    standard: "ISO 14001", dueDate: "Apr 15, 2026", priority: "MEDIUM",   assignee: "Tom R.",     description: "Update the environmental aspects register.",               status: "Todo"        },
  { id: "3",  title: "Conduct internal audit for clause 9.2",    standard: "ISO 9001",  dueDate: "Apr 18, 2026", priority: "HIGH",     assignee: "James O.",   description: "Plan and execute internal audit for clause 9.2.",          status: "Todo"        },
  { id: "4",  title: "Review AI system impact assessment",       standard: "ISO 42001", dueDate: "Apr 25, 2026", priority: "MEDIUM",   assignee: "Unassigned", description: "Conduct impact assessment of AI systems in scope.",        status: "Todo"        },
];

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

const TODAY = new Date("2026-04-07");

function isOverdue(dueDate: string) {
  try { return new Date(dueDate) < TODAY; } catch { return false; }
}

const iconMap: Record<string, React.ElementType> = {
  FileCheck2, CheckCircle2, Clock, AlertTriangle,
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

export default function DashboardPage() {
  const totalScore = Math.round(complianceScores.reduce((s, i) => s + i.score, 0) / complianceScores.length);
  const totalImplemented = complianceScores.reduce((s, i) => s + i.implemented, 0);
  const totalControls    = complianceScores.reduce((s, i) => s + i.total, 0);
  const totalInProgress  = 14; // mock
  const totalNotStarted  = totalControls - totalImplemented - totalInProgress - 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Compliance overview for Acme Ltd</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <TrendingUp className="size-4 mr-1.5" />View Reports
            </Button>
          </Link>
          <Link href="/projects">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="size-4 mr-1.5" />New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Top overview: donut + stats + control distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall score donut */}
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
          <p className="text-xs text-green-600 mt-4 font-medium">+4% this month</p>
          <div className="flex gap-4 mt-3">
            {[
              { label: "Controls met",  value: totalImplemented, color: "text-emerald-600" },
              { label: "Total controls", value: totalControls,    color: "text-foreground"  },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Bar chart: compliance by standard */}
        <Card className="lg:col-span-2 px-6 py-5 flex flex-col">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-4">Compliance by Standard</p>
          <div className="flex-1 flex flex-col justify-center">
            <MiniBarChart
              scores={complianceScores.map((s) => ({ label: s.standard, value: s.score, color: s.barColor }))}
            />
          </div>
        </Card>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/tasks" className="block">
          <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Open Tasks</p>
              <p className="text-3xl font-bold text-foreground mt-1">24</p>
              <Link href="/tasks?filter=overdue" className="text-xs text-red-600 mt-1 flex items-center gap-1 hover:underline w-fit" onClick={(e) => e.stopPropagation()}>
                <AlertTriangle className="size-3" /> 3 overdue
              </Link>
            </CardContent>
          </Card>
        </Link>
        <Link href="/evidence" className="block">
          <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Evidence Files</p>
              <p className="text-3xl font-bold text-foreground mt-1">147</p>
              <p className="text-xs text-muted-foreground mt-1">12 added this week</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="h-full">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Active Standards</p>
            <p className="text-3xl font-bold text-foreground mt-1">5</p>
            <p className="text-xs text-muted-foreground mt-1">2 near certification</p>
          </CardContent>
        </Card>
        <Card className="h-full flex flex-col items-center justify-center py-3 gap-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Control Status</p>
          <div className="relative">
            <ControlStatusDonut
              implemented={totalImplemented}
              inProgress={totalInProgress}
              notStarted={totalNotStarted}
              nonCompliant={3}
              total={totalControls}
              size={64}
            />
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            {[
              { label: "Done",   color: "bg-emerald-500", value: totalImplemented },
              { label: "Active", color: "bg-blue-500",    value: totalInProgress  },
              { label: "To do",  color: "bg-slate-300",   value: totalNotStarted  },
              { label: "Issues", color: "bg-red-500",     value: 3                },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1">
                <div className={`size-1.5 rounded-full shrink-0 ${s.color}`} />
                <span className="text-[9px] text-muted-foreground">{s.label} {s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Compliance by Standard — cards with donut + progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Standards — click to explore</h2>
          <Link href="/projects" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            All projects <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {complianceScores.map((item) => (
            <Link key={item.code} href={item.href} className="block group">
              <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    {/* Mini donut */}
                    <div className="relative shrink-0">
                      <DonutChart score={item.score} size={56} stroke={6} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-[10px] font-bold ${scoreTextColor(item.score)}`}>{item.score}%</span>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="text-sm font-semibold text-foreground group-hover:text-blue-600 transition-colors leading-snug">
                          {item.standard}
                        </p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${statusColors[item.status] ?? "bg-slate-100 text-slate-700"}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{item.implemented}/{item.total} controls</p>
                      {/* Progress bar */}
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${scoreColor(item.score)} rounded-full transition-all duration-500`}
                          style={{ width: `${item.score}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-muted-foreground">{item.trend} this month</span>
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

      {/* Activity & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <ul className="space-y-1">
              {recentActivity.map((activity) => {
                const Icon = iconMap[activity.icon] ?? FileCheck2;
                return (
                  <li key={activity.id}>
                    <Link href={`/activity?id=${activity.id}`}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                      <span className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${activity.iconClass}`}>
                        <Icon className="size-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug group-hover:text-blue-600 transition-colors">
                          {activity.text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{activity.who} · {activity.when}</p>
                      </div>
                      <ArrowRight className="size-3.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                );
              })}
            </ul>
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
                  {upcomingTasks.filter((t) => isOverdue(t.dueDate)).length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      <AlertTriangle className="size-2.5" />
                      {upcomingTasks.filter((t) => isOverdue(t.dueDate)).length} overdue
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
            {/* Overdue alert banner */}
            {upcomingTasks.some((t) => isOverdue(t.dueDate)) && (
              <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-red-500 shrink-0" />
                  <p className="text-xs font-medium text-red-700">
                    {upcomingTasks.filter((t) => isOverdue(t.dueDate)).length} task{upcomingTasks.filter((t) => isOverdue(t.dueDate)).length !== 1 ? "s are" : " is"} past due — action needed
                  </p>
                </div>
                <Link href="/tasks?filter=overdue"
                  className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                  Open overdue <ArrowRight className="size-3" />
                </Link>
              </div>
            )}
            <ul className="space-y-2">
              {upcomingTasks.map((task) => {
                const od = isOverdue(task.dueDate);
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
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className={`text-xs flex items-center gap-1 font-medium ${od ? "text-red-600" : "text-muted-foreground"}`}>
                            <Clock className="size-3" />
                            {od ? `Overdue · ${task.dueDate}` : task.dueDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <User className="size-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{task.assignee}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Start New Project",  href: "/projects",  icon: Plus,        color: "text-blue-600"   },
              { label: "Upload Evidence",    href: "/evidence",  icon: FileCheck2,  color: "text-green-600"  },
              { label: "Run Gap Analysis",   href: "/reports",   icon: TrendingUp,  color: "text-amber-600"  },
              { label: "Invite Team Member", href: "/team",      icon: User,        color: "text-purple-600" },
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
