"use client";

import React, { useState } from "react";
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
  User,
  Paperclip,
  MessageSquare,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ControlStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "IMPLEMENTED"
  | "NOT_APPLICABLE"
  | "NON_COMPLIANT";

interface MockControl {
  ref: string;
  title: string;
  status: ControlStatus;
  evidenceCount: number;
  taskCount: number;
  notes?: string;
}

interface MockClause {
  number: string;
  title: string;
  controls: MockControl[];
}

const mockProjectData: Record<
  string,
  {
    name: string;
    standard: string;
    status: string;
    score: number;
    targetDate: string;
    clauses: MockClause[];
  }
> = {
  "proj-1": {
    name: "ISO 27001 Certification 2026",
    standard: "ISO/IEC 27001:2022",
    status: "ACTIVE",
    score: 68,
    targetDate: "Sep 30, 2026",
    clauses: [
      {
        number: "A.5",
        title: "Organizational Controls",
        controls: [
          { ref: "A.5.1", title: "Policies for information security", status: "IMPLEMENTED", evidenceCount: 3, taskCount: 0 },
          { ref: "A.5.2", title: "Information security roles and responsibilities", status: "IMPLEMENTED", evidenceCount: 2, taskCount: 0 },
          { ref: "A.5.3", title: "Segregation of duties", status: "IN_PROGRESS", evidenceCount: 1, taskCount: 2 },
          { ref: "A.5.7", title: "Threat intelligence", status: "NOT_STARTED", evidenceCount: 0, taskCount: 1 },
          { ref: "A.5.8", title: "Information security in project management", status: "IN_PROGRESS", evidenceCount: 1, taskCount: 1 },
          { ref: "A.5.9", title: "Inventory of information and other associated assets", status: "IMPLEMENTED", evidenceCount: 4, taskCount: 0 },
          { ref: "A.5.12", title: "Classification of information", status: "IN_PROGRESS", evidenceCount: 1, taskCount: 2 },
          { ref: "A.5.15", title: "Access control", status: "IMPLEMENTED", evidenceCount: 5, taskCount: 0 },
          { ref: "A.5.16", title: "Identity management", status: "IMPLEMENTED", evidenceCount: 2, taskCount: 0 },
          { ref: "A.5.23", title: "Information security for use of cloud services", status: "NOT_STARTED", evidenceCount: 0, taskCount: 3 },
        ],
      },
      {
        number: "A.6",
        title: "People Controls",
        controls: [
          { ref: "A.6.1", title: "Screening", status: "IMPLEMENTED", evidenceCount: 2, taskCount: 0 },
          { ref: "A.6.2", title: "Terms and conditions of employment", status: "IMPLEMENTED", evidenceCount: 1, taskCount: 0 },
          { ref: "A.6.3", title: "Information security awareness, education and training", status: "IN_PROGRESS", evidenceCount: 2, taskCount: 2 },
          { ref: "A.6.4", title: "Disciplinary process", status: "NOT_STARTED", evidenceCount: 0, taskCount: 1 },
        ],
      },
      {
        number: "A.7",
        title: "Physical Controls",
        controls: [
          { ref: "A.7.1", title: "Physical security perimeters", status: "IMPLEMENTED", evidenceCount: 3, taskCount: 0 },
          { ref: "A.7.2", title: "Physical entry", status: "IMPLEMENTED", evidenceCount: 2, taskCount: 0 },
          { ref: "A.7.4", title: "Physical security monitoring", status: "IN_PROGRESS", evidenceCount: 1, taskCount: 1 },
          { ref: "A.7.6", title: "Working in secure areas", status: "NON_COMPLIANT", evidenceCount: 0, taskCount: 3, notes: "Gaps identified in data centre access policy" },
          { ref: "A.7.8", title: "Equipment siting and protection", status: "IMPLEMENTED", evidenceCount: 2, taskCount: 0 },
        ],
      },
      {
        number: "A.8",
        title: "Technological Controls",
        controls: [
          { ref: "A.8.1", title: "User endpoint devices", status: "IMPLEMENTED", evidenceCount: 4, taskCount: 0 },
          { ref: "A.8.2", title: "Privileged access rights", status: "IN_PROGRESS", evidenceCount: 2, taskCount: 2 },
          { ref: "A.8.5", title: "Secure authentication", status: "IMPLEMENTED", evidenceCount: 3, taskCount: 0 },
          { ref: "A.8.7", title: "Protection against malware", status: "IMPLEMENTED", evidenceCount: 3, taskCount: 0 },
          { ref: "A.8.8", title: "Management of technical vulnerabilities", status: "IN_PROGRESS", evidenceCount: 1, taskCount: 3 },
          { ref: "A.8.16", title: "Monitoring activities", status: "NOT_STARTED", evidenceCount: 0, taskCount: 2 },
          { ref: "A.8.24", title: "Use of cryptography", status: "IMPLEMENTED", evidenceCount: 2, taskCount: 0 },
          { ref: "A.8.28", title: "Secure coding", status: "NOT_APPLICABLE", evidenceCount: 0, taskCount: 0 },
        ],
      },
    ],
  },
};

// ── Mock tasks per project ─────────────────────────────────────────────────────

const mockProjectTasks: Record<string, { id: string; title: string; control: string; assignee: string; assigneeInitials: string; assigneeColor: string; dueDate: string; priority: string; status: string; comments: number; attachments: number }[]> = {
  "proj-1": [
    { id: "t1", title: "Complete risk assessment documentation", control: "6.1.2", assignee: "Sarah K.", assigneeInitials: "SK", assigneeColor: "bg-blue-500", dueDate: "Apr 12, 2026", priority: "HIGH", status: "In Progress", comments: 2, attachments: 1 },
    { id: "t2", title: "Update access control matrix", control: "A.9.1", assignee: "Sarah K.", assigneeInitials: "SK", assigneeColor: "bg-blue-500", dueDate: "May 2, 2026", priority: "HIGH", status: "In Review", comments: 2, attachments: 1 },
    { id: "t3", title: "Review and update ISMS Statement of Applicability", control: "6.1.3", assignee: "Sarah K.", assigneeInitials: "SK", assigneeColor: "bg-blue-500", dueDate: "May 12, 2026", priority: "CRITICAL", status: "Todo", comments: 0, attachments: 0 },
    { id: "t4", title: "Implement threat intelligence feed", control: "A.5.7", assignee: "James O.", assigneeInitials: "JO", assigneeColor: "bg-emerald-500", dueDate: "Apr 30, 2026", priority: "MEDIUM", status: "Todo", comments: 0, attachments: 0 },
  ],
  "proj-2": [
    { id: "t5", title: "Conduct internal audit for clause 9.2", control: "9.2", assignee: "James O.", assigneeInitials: "JO", assigneeColor: "bg-emerald-500", dueDate: "Apr 18, 2026", priority: "HIGH", status: "Todo", comments: 1, attachments: 1 },
    { id: "t6", title: "Document corrective actions for non-conformances", control: "10.2", assignee: "James O.", assigneeInitials: "JO", assigneeColor: "bg-emerald-500", dueDate: "Apr 28, 2026", priority: "HIGH", status: "In Progress", comments: 1, attachments: 1 },
  ],
  "proj-3": [
    { id: "t7", title: "Update environmental aspects register", control: "6.1.2", assignee: "Tom R.", assigneeInitials: "TR", assigneeColor: "bg-purple-500", dueDate: "Apr 15, 2026", priority: "MEDIUM", status: "Todo", comments: 0, attachments: 0 },
  ],
  "proj-4": [
    { id: "t8", title: "Conduct H&S inspection of all work areas", control: "9.1", assignee: "Tom R.", assigneeInitials: "TR", assigneeColor: "bg-purple-500", dueDate: "May 15, 2026", priority: "HIGH", status: "Done", comments: 1, attachments: 1 },
  ],
  "proj-5": [
    { id: "t9", title: "Review AI system impact assessment", control: "6.1", assignee: "Unassigned", assigneeInitials: "?", assigneeColor: "bg-slate-400", dueDate: "Apr 25, 2026", priority: "MEDIUM", status: "Todo", comments: 0, attachments: 0 },
  ],
};

// ── Generate a fallback project for unknown IDs ────────────────────────────────

function getFallbackProject(id: string) {
  return {
    name: `Compliance Project ${id}`,
    standard: "ISO/IEC 27001:2022",
    status: "ACTIVE",
    score: 45,
    targetDate: "Dec 31, 2026",
    clauses: mockProjectData["proj-1"].clauses,
  };
}

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

function ClauseBarChart({ clauses }: { clauses: MockClause[] }) {
  return (
    <div className="space-y-2">
      {clauses.map((clause) => {
        const done = clause.controls.filter((c) => c.status === "IMPLEMENTED").length;
        const pct = Math.round((done / clause.controls.length) * 100);
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
  { label: string; icon: React.ElementType; className: string; dotColor: string }
> = {
  NOT_STARTED: {
    label: "Not Started",
    icon: Circle,
    className: "text-slate-500 bg-slate-100",
    dotColor: "bg-slate-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Clock,
    className: "text-blue-700 bg-blue-100",
    dotColor: "bg-blue-500",
  },
  IMPLEMENTED: {
    label: "Implemented",
    icon: CheckCircle2,
    className: "text-green-700 bg-green-100",
    dotColor: "bg-green-500",
  },
  NOT_APPLICABLE: {
    label: "N/A",
    icon: MinusCircle,
    className: "text-slate-500 bg-slate-100",
    dotColor: "bg-slate-300",
  },
  NON_COMPLIANT: {
    label: "Non-Compliant",
    icon: XCircle,
    className: "text-red-700 bg-red-100",
    dotColor: "bg-red-500",
  },
};

type FilterTab =
  | "all"
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "IMPLEMENTED"
  | "NON_COMPLIANT";

export default function ProjectDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = React.use(paramsPromise);
  const [mainTab, setMainTab] = useState<"overview" | "controls" | "tasks">("overview");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(
    new Set(["A.5", "A.6", "A.7", "A.8"])
  );

  const project = mockProjectData[params.id] ?? getFallbackProject(params.id);
  const projectTasks = mockProjectTasks[params.id] ?? [];

  function toggleClause(number: string) {
    setExpandedClauses((prev) => {
      const next = new Set(prev);
      if (next.has(number)) {
        next.delete(number);
      } else {
        next.add(number);
      }
      return next;
    });
  }

  function filterControls(controls: MockControl[]): MockControl[] {
    if (activeTab === "all") return controls;
    return controls.filter((c) => c.status === activeTab);
  }

  const allControls = project.clauses.flatMap((c) => c.controls);
  const counts = {
    all: allControls.length,
    NOT_STARTED: allControls.filter((c) => c.status === "NOT_STARTED").length,
    IN_PROGRESS: allControls.filter((c) => c.status === "IN_PROGRESS").length,
    IMPLEMENTED: allControls.filter((c) => c.status === "IMPLEMENTED").length,
    NON_COMPLIANT: allControls.filter((c) => c.status === "NON_COMPLIANT").length,
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/projects"
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="size-3.5" />
          Projects
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {project.standard} ·{" "}
            <span className="text-green-600 font-medium">{project.status}</span>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" render={<Link href="/reports" />}>
            <BarChart3 className="size-4 mr-1.5" />
            Gap Report
          </Button>
        </div>
      </div>

      {/* Stats + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score donut */}
        <Card className="flex flex-col items-center justify-center py-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">Compliance Score</p>
          <div className="relative">
            <DonutChart value={project.score} total={100} size={100} stroke={10}
              color={project.score >= 90 ? "#10b981" : project.score >= 70 ? "#3b82f6" : project.score >= 40 ? "#f59e0b" : "#ef4444"} />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xl font-bold text-foreground">{project.score}%</p>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-center">
            <div>
              <p className="text-base font-bold text-emerald-600">{counts.IMPLEMENTED}</p>
              <p className="text-[10px] text-muted-foreground">Implemented</p>
            </div>
            <div>
              <p className="text-base font-bold text-blue-600">{counts.IN_PROGRESS}</p>
              <p className="text-[10px] text-muted-foreground">In Progress</p>
            </div>
            <div>
              <p className="text-base font-bold text-slate-500">{counts.NOT_STARTED}</p>
              <p className="text-[10px] text-muted-foreground">Not Started</p>
            </div>
          </div>
        </Card>

        {/* Clause bar chart */}
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
          <p className="text-2xl font-bold text-amber-600">{projectTasks.filter((t) => t.status !== "Done").length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-xs text-muted-foreground">Target Date</p>
          <p className="text-sm font-semibold text-foreground mt-1 flex items-center gap-1">
            <Calendar className="size-3.5 text-muted-foreground" />{project.targetDate}
          </p>
        </CardContent></Card>
      </div>

      {/* Main tabs: Overview / Controls / Tasks */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as typeof mainTab)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="controls">Controls ({counts.all})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({projectTasks.length})</TabsTrigger>
        </TabsList>

        {/* ── Tasks tab ───────────────────────────────────────────── */}
        <TabsContent value="tasks" className="mt-4">
          {projectTasks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ListTodo className="size-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No tasks for this project.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_6rem_5rem_5rem_4rem] bg-muted px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                <span>Task</span><span>Assignee</span><span>Due</span><span>Priority</span><span>Status</span>
              </div>
              {projectTasks.map((t) => {
                const priorityColor: Record<string, string> = { CRITICAL: "text-red-700 bg-red-50", HIGH: "text-orange-700 bg-orange-50", MEDIUM: "text-amber-700 bg-amber-50", LOW: "text-slate-600 bg-slate-50" };
                const statusColor: Record<string, string> = { "Todo": "text-slate-600 bg-slate-100", "In Progress": "text-blue-700 bg-blue-100", "In Review": "text-amber-700 bg-amber-100", "Done": "text-emerald-700 bg-emerald-100" };
                return (
                  <Link key={t.id} href={`/tasks?id=${t.id}`}
                    className="grid grid-cols-[1fr_6rem_5rem_5rem_4rem] px-4 py-2.5 border-t border-border hover:bg-muted/40 transition-colors items-center group">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-foreground group-hover:text-blue-600 transition-colors truncate">{t.title}</span>
                      {t.comments > 0 && <div className="flex items-center gap-0.5 text-muted-foreground shrink-0"><MessageSquare className="size-3" /><span className="text-[10px]">{t.comments}</span></div>}
                      {t.attachments > 0 && <div className="flex items-center gap-0.5 text-muted-foreground shrink-0"><Paperclip className="size-3" /><span className="text-[10px]">{t.attachments}</span></div>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`size-5 rounded-full ${t.assigneeColor} flex items-center justify-center shrink-0`}>
                        <span className="text-[8px] font-bold text-white">{t.assigneeInitials}</span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{t.assignee}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.dueDate.replace(", 2026", "")}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded w-fit ${priorityColor[t.priority] ?? ""}`}>{t.priority}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded w-fit ${statusColor[t.status] ?? ""}`}>{t.status}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Controls tab ────────────────────────────────────────── */}
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
            const clauseImplemented = clause.controls.filter(
              (c) => c.status === "IMPLEMENTED"
            ).length;
            const clausePct = Math.round(
              (clauseImplemented / clause.controls.length) * 100
            );

            return (
              <Card key={clause.number}>
                {/* Clause header */}
                <button
                  onClick={() => toggleClause(clause.number)}
                  className="w-full text-left"
                >
                  <CardHeader className="pb-3 flex-row items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {clause.number}
                        </span>
                        <CardTitle className="text-sm font-semibold">
                          {clause.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 max-w-32">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${clausePct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {clauseImplemented}/{clause.controls.length}{" "}
                          implemented
                        </span>
                        <CardDescription className="text-xs">
                          {clausePct}%
                        </CardDescription>
                      </div>
                    </div>
                    {expanded ? (
                      <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    )}
                  </CardHeader>
                </button>

                {/* Controls table */}
                {expanded && (
                  <CardContent className="pt-0">
                    <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                      {filtered.map((control) => {
                        const conf = statusConfig[control.status];
                        return (
                          <div
                            key={control.ref}
                            className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors"
                          >
                            <span
                              className={`size-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${conf.className}`}
                            >
                              <conf.icon className="size-3.5" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 flex-wrap">
                                <span className="text-xs font-bold text-muted-foreground shrink-0">
                                  {control.ref}
                                </span>
                                <span className="text-sm text-foreground leading-snug">
                                  {control.title}
                                </span>
                              </div>
                              {control.notes && (
                                <p className="text-xs text-red-600 mt-1">
                                  {control.notes}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <FileText className="size-3" />
                                  {control.evidenceCount} evidence
                                </span>
                                {control.taskCount > 0 && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {control.taskCount} tasks
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`shrink-0 text-xs ${conf.className} border-0`}
                            >
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

        {/* ── Overview tab ────────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.clauses.map((clause) => {
              const done  = clause.controls.filter((c) => c.status === "IMPLEMENTED").length;
              const inProg = clause.controls.filter((c) => c.status === "IN_PROGRESS").length;
              const nc    = clause.controls.filter((c) => c.status === "NON_COMPLIANT").length;
              const pct   = Math.round((done / clause.controls.length) * 100);
              const color = pct >= 90 ? "#10b981" : pct >= 70 ? "#3b82f6" : pct >= 40 ? "#f59e0b" : "#ef4444";
              return (
                <Card key={clause.number}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <DonutChart value={done} total={clause.controls.length} size={52} stroke={5} color={color} />
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
