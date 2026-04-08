"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  ShieldCheck, BarChart3, FileCheck2, ListTodo, FileText,
  CheckCircle2, AlertTriangle, Clock, User, Paperclip,
  TrendingUp, Lock, Bell, Activity, Plus,
} from "lucide-react";
import { LogoLink } from "@/components/landing/logo-link";

// ── Steps ──────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "dashboard",
    step: "01",
    title: "See your compliance posture at a glance",
    description: "The dashboard gives you a real-time view of every ISO standard you manage. Colour-coded progress bars immediately show where you're strong and where attention is needed — before your auditor finds out.",
    icon: BarChart3,
  },
  {
    id: "gap",
    step: "02",
    title: "Run a gap analysis in minutes",
    description: "Answer structured questions about your current controls. ISOComply maps your responses against every ISO requirement and instantly produces a prioritised gap list with recommended remediation steps.",
    icon: ShieldCheck,
  },
  {
    id: "evidence",
    step: "03",
    title: "Centralise all your evidence",
    description: "Upload policies, procedures, and audit trails. Each document is automatically linked to the ISO controls it satisfies, and expiry reminders keep your evidence vault perpetually audit-ready.",
    icon: FileCheck2,
  },
  {
    id: "tasks",
    step: "04",
    title: "Assign and track remediation tasks",
    description: "Turn every gap into an assigned task with a due date, owner, and acceptance criteria. Your team works in a familiar board — no training required.",
    icon: ListTodo,
  },
  {
    id: "report",
    step: "05",
    title: "Generate audit reports in one click",
    description: "When your auditor asks for evidence, just hit Generate. ISOComply compiles a complete, professionally formatted audit pack — PDF or shareable link — in seconds.",
    icon: FileText,
  },
];

// ── App Mockups (white/light — matches the real app) ───────────────────────────

function BrowserFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xl bg-white text-xs">
      {/* Chrome bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 bg-[#e8eaed]">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-[#ff5f57]" />
          <div className="size-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="size-2.5 rounded-full bg-[#28c940]" />
        </div>
        <div className="flex-1 bg-white rounded border border-slate-300 px-2.5 py-0.5 flex items-center gap-1.5">
          <ShieldCheck className="size-2.5 text-blue-600" />
          <span className="text-[10px] text-slate-500">{title}</span>
        </div>
      </div>
      {/* App layout */}
      <div className="flex" style={{ height: 360 }}>
        {/* Sidebar */}
        <div className="w-28 bg-slate-50 border-r border-slate-200 flex flex-col py-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 pb-2 mb-1 border-b border-slate-200">
            <div className="size-5 rounded bg-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-3 text-white" />
            </div>
            <span className="text-[9px] font-bold text-slate-800">ISOComply</span>
          </div>
          {[
            { label: "Dashboard",   icon: BarChart3,  active: false },
            { label: "Standards",   icon: ShieldCheck, active: false },
            { label: "Projects",    icon: FileText,    active: false },
            { label: "Tasks",       icon: ListTodo,    active: false },
            { label: "Evidence",    icon: FileCheck2,  active: false },
            { label: "Gap Analysis",icon: TrendingUp,  active: false },
          ].map((item) => (
            <div key={item.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 mx-1 rounded text-[9px] font-medium ${item.active ? "bg-blue-50 text-blue-700" : "text-slate-600"}`}>
              <item.icon className="size-3 shrink-0" />
              {item.label}
            </div>
          ))}
        </div>
        {/* Main content */}
        <div className="flex-1 bg-white overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  const standards = [
    { name: "ISO 27001", score: 68, color: "#3b82f6" },
    { name: "ISO 9001",  score: 84, color: "#22c55e" },
    { name: "ISO 14001", score: 42, color: "#f59e0b" },
    { name: "ISO 45001", score: 91, color: "#10b981" },
    { name: "ISO 42001", score: 23, color: "#a855f7" },
  ];
  return (
    <BrowserFrame title="app.isocomply.io/dashboard">
      <div className="p-3 space-y-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-900">Dashboard</p>
            <p className="text-[9px] text-slate-500">Compliance overview</p>
          </div>
          <div className="flex gap-1.5">
            <div className="flex items-center gap-1 px-2 py-1 rounded border border-slate-200 text-[9px] text-slate-600">
              <TrendingUp className="size-2.5" />View Reports
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600 text-[9px] text-white">
              <Plus className="size-2.5" />New Project
            </div>
          </div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Overall Score", value: "62%", color: "text-blue-600" },
            { label: "Open Tasks",    value: "24",  color: "text-slate-900" },
            { label: "Evidence Files",value: "147", color: "text-slate-900" },
            { label: "Standards",     value: "5",   color: "text-slate-900" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-slate-200 p-2">
              <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[8px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
        {/* Standards */}
        <div className="rounded-lg border border-slate-200 p-2.5">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Compliance by Standard</p>
          <div className="space-y-1.5">
            {standards.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="text-[9px] text-slate-600 w-16 shrink-0">{s.name}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
                </div>
                <span className="text-[9px] font-bold w-6 text-right shrink-0" style={{ color: s.color }}>{s.score}%</span>
              </div>
            ))}
          </div>
        </div>
        {/* Activity */}
        <div className="rounded-lg border border-slate-200 p-2.5">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Recent Activity</p>
          {[
            { icon: CheckCircle2, text: "Access control policy approved", time: "2 min ago", cls: "text-emerald-600 bg-emerald-50" },
            { icon: FileCheck2,   text: "Evidence uploaded: ISMS-Scope.pdf", time: "18 min ago", cls: "text-blue-600 bg-blue-50" },
            { icon: AlertTriangle,text: "Risk assessment due in 3 days", time: "1 hr ago", cls: "text-amber-600 bg-amber-50" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-slate-100 last:border-0">
              <span className={`size-5 rounded flex items-center justify-center shrink-0 ${a.cls}`}>
                <a.icon className="size-2.5" />
              </span>
              <span className="text-[9px] text-slate-700 flex-1 truncate">{a.text}</span>
              <span className="text-[8px] text-slate-400 shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function GapMockup() {
  const controls = [
    { ref: "6.1.1", name: "Information security objectives", status: "met",     risk: "Low",      riskColor: "text-emerald-600" },
    { ref: "6.1.2", name: "Risk assessment process",         status: "partial", risk: "High",     riskColor: "text-orange-600" },
    { ref: "6.1.3", name: "Statement of Applicability",      status: "gap",     risk: "Critical", riskColor: "text-red-600" },
    { ref: "7.2",   name: "Competence records",              status: "met",     risk: "Low",      riskColor: "text-emerald-600" },
    { ref: "8.1",   name: "Operational planning & control",  status: "partial", risk: "Medium",   riskColor: "text-amber-600" },
    { ref: "9.2",   name: "Internal audit programme",        status: "gap",     risk: "High",     riskColor: "text-orange-600" },
  ];
  const statusStyle: Record<string, string> = {
    met:     "bg-emerald-50 text-emerald-700 border-emerald-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    gap:     "bg-red-50 text-red-700 border-red-200",
  };
  const statusLabel: Record<string, string> = { met: "Met", partial: "Partial", gap: "Gap" };
  return (
    <BrowserFrame title="app.isocomply.io/gap-analysis">
      <div className="p-3 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold text-slate-900">Gap Analysis · ISO 27001</p>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">68% Complete</span>
        </div>
        <div className="flex gap-1.5 mb-2.5">
          {[
            { label: "2 Gaps",    color: "bg-red-50 text-red-700 border-red-200" },
            { label: "2 Partial", color: "bg-amber-50 text-amber-700 border-amber-200" },
            { label: "2 Met",     color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          ].map((c) => (
            <span key={c.label} className={`text-[9px] px-2 py-0.5 rounded border font-semibold ${c.color}`}>{c.label}</span>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-[2rem_1fr_4rem_4rem] bg-slate-50 px-2 py-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">
            <span>Ref</span><span>Control</span><span className="text-center">Status</span><span className="text-center">Risk</span>
          </div>
          {controls.map((c) => (
            <div key={c.ref} className="grid grid-cols-[2rem_1fr_4rem_4rem] px-2 py-1.5 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50">
              <span className="text-[9px] font-mono text-slate-400">{c.ref}</span>
              <span className="text-[9px] text-slate-700 truncate pr-2">{c.name}</span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded border text-center font-semibold mx-auto ${statusStyle[c.status]}`}>{statusLabel[c.status]}</span>
              <span className={`text-[9px] text-center font-medium ${c.riskColor}`}>{c.risk}</span>
            </div>
          ))}
        </div>
        {/* AI recommendation box */}
        <div className="mt-2.5 rounded-lg bg-blue-50 border border-blue-200 p-2">
          <p className="text-[9px] font-semibold text-blue-800 mb-0.5">AI Recommendation</p>
          <p className="text-[8px] text-blue-700 leading-relaxed">Address ISO 27001 §6.1.3 (Statement of Applicability) first — it is a mandatory prerequisite for certification.</p>
        </div>
      </div>
    </BrowserFrame>
  );
}

function EvidenceMockup() {
  const files = [
    { name: "Information Security Policy v2.1.pdf", standard: "ISO 27001", control: "5.2",   expires: "Dec 2026", status: "valid" },
    { name: "Risk Register Q1 2026.xlsx",           standard: "ISO 27001", control: "6.1.2", expires: "Apr 2026", status: "expiring" },
    { name: "Internal Audit Report Mar 2026.pdf",   standard: "ISO 9001",  control: "9.2",   expires: "Mar 2027", status: "valid" },
    { name: "Environmental Aspects Register.xlsx",  standard: "ISO 14001", control: "6.1.2", expires: "Jun 2026", status: "valid" },
  ];
  return (
    <BrowserFrame title="app.isocomply.io/evidence">
      <div className="p-3 space-y-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-900">Evidence Vault</p>
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600 text-[9px] text-white">
            <Plus className="size-2.5" />Upload Evidence
          </div>
        </div>
        <div className="border-2 border-dashed border-slate-300 rounded-lg py-3 text-center bg-slate-50">
          <Paperclip className="size-4 text-slate-400 mx-auto mb-1" />
          <p className="text-[9px] text-slate-500">Drag & drop files, or <span className="text-blue-600">browse</span></p>
          <p className="text-[8px] text-slate-400 mt-0.5">PDF, DOCX, XLSX, PNG up to 50 MB</p>
        </div>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-3 py-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wide flex gap-2 border-b border-slate-200">
            <span className="flex-1">Document</span><span className="w-12">Control</span><span className="w-14">Expires</span><span className="w-12 text-right">Status</span>
          </div>
          {files.map((f) => (
            <div key={f.name} className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <div className="size-6 rounded bg-blue-50 flex items-center justify-center shrink-0">
                <Paperclip className="size-3 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-slate-800 truncate">{f.name}</p>
                <p className="text-[8px] text-slate-400">{f.standard}</p>
              </div>
              <span className="text-[8px] text-slate-400 w-12 shrink-0 font-mono">{f.control}</span>
              <span className="text-[8px] text-slate-400 w-14 shrink-0">{f.expires}</span>
              <span className={`text-[8px] font-semibold w-12 text-right shrink-0 ${f.status === "expiring" ? "text-amber-600" : "text-emerald-600"}`}>
                {f.status === "expiring" ? "⚠ Expiring" : "✓ Valid"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function TasksMockup() {
  const tasks = [
    { title: "Complete risk assessment documentation",   status: "In Progress", assignee: "SK", due: "Apr 12", priority: "HIGH",     pColor: "text-orange-600 bg-orange-50 border-orange-200" },
    { title: "Update Statement of Applicability",        status: "To Do",       assignee: "SK", due: "May 12", priority: "CRITICAL", pColor: "text-red-600 bg-red-50 border-red-200" },
    { title: "Conduct internal audit clause 9.2",        status: "To Do",       assignee: "JO", due: "Apr 18", priority: "HIGH",     pColor: "text-orange-600 bg-orange-50 border-orange-200" },
    { title: "Update access control matrix",             status: "In Review",   assignee: "SK", due: "May 2",  priority: "HIGH",     pColor: "text-orange-600 bg-orange-50 border-orange-200" },
    { title: "H&S inspection of all work areas",         status: "Done",        assignee: "TR", due: "May 15", priority: "MEDIUM",   pColor: "text-amber-600 bg-amber-50 border-amber-200" },
  ];
  const statusStyle: Record<string, string> = {
    "To Do":       "bg-slate-100 text-slate-600",
    "In Progress": "bg-blue-50 text-blue-700",
    "In Review":   "bg-amber-50 text-amber-700",
    "Done":        "bg-emerald-50 text-emerald-700",
  };
  const avatarColor: Record<string, string> = { SK: "bg-blue-500", JO: "bg-emerald-500", TR: "bg-purple-500" };
  return (
    <BrowserFrame title="app.isocomply.io/tasks">
      <div className="p-3 overflow-hidden">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] font-bold text-slate-900">Tasks</p>
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600 text-[9px] text-white">
            <Plus className="size-2.5" />New Task
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-[1fr_5rem_3.5rem_4.5rem] bg-slate-50 px-3 py-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">
            <span>Task</span><span>Status</span><span>Due</span><span>Priority</span>
          </div>
          {tasks.map((t, i) => (
            <div key={i} className="grid grid-cols-[1fr_5rem_3.5rem_4.5rem] px-3 py-2 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`size-5 rounded-full ${avatarColor[t.assignee] ?? "bg-slate-400"} flex items-center justify-center shrink-0`}>
                  <span className="text-[7px] font-bold text-white">{t.assignee}</span>
                </div>
                <span className="text-[9px] text-slate-700 truncate">{t.title}</span>
              </div>
              <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium w-fit ${statusStyle[t.status]}`}>{t.status}</span>
              <span className="text-[8px] text-slate-500 flex items-center gap-0.5"><Clock className="size-2" />{t.due}</span>
              <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded border ${t.pColor}`}>{t.priority}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

function ReportMockup() {
  return (
    <BrowserFrame title="app.isocomply.io/reports">
      <div className="p-3 space-y-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-slate-900">Audit Report Generator</p>
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600 text-[9px] text-white">
            <TrendingUp className="size-2.5" />Generate Report
          </div>
        </div>
        {/* Report preview card */}
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="size-3.5 text-white" />
              <span className="text-[10px] font-bold text-white">ISOComply</span>
            </div>
            <p className="text-[11px] font-bold text-white">ISO 27001:2022 Audit Report</p>
            <p className="text-[9px] text-blue-200 mt-0.5">Acme Ltd · April 2026 · 68% Compliance</p>
          </div>
          <div className="p-3 space-y-2 bg-white">
            {[
              { section: "Executive Summary",    lines: 2 },
              { section: "Compliance Score",     lines: 1 },
              { section: "Controls Assessment",  lines: 3 },
              { section: "Evidence Index",       lines: 2 },
            ].map((s) => (
              <div key={s.section}>
                <p className="text-[8px] font-semibold text-blue-600 mb-1">{s.section}</p>
                {Array.from({ length: s.lines }).map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full bg-slate-200 mb-1 ${i === s.lines - 1 ? "w-2/3" : "w-full"}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-[9px] font-semibold text-white">
            <TrendingUp className="size-3" /> Download PDF
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-[9px] font-semibold text-slate-600">
            <Lock className="size-3" /> Share Link
          </button>
        </div>
        <p className="text-center text-[8px] text-slate-400 flex items-center justify-center gap-1">
          <Bell className="size-2.5" /> Report auto-updates when new evidence is added
        </p>
      </div>
    </BrowserFrame>
  );
}

const MOCKUPS: Record<string, React.ReactNode> = {
  dashboard: <DashboardMockup />,
  gap:       <GapMockup />,
  evidence:  <EvidenceMockup />,
  tasks:     <TasksMockup />,
  report:    <ReportMockup />,
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0f1e" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ background: "radial-gradient(ellipse at 70% 20%, rgba(59,130,246,0.07) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(139,92,246,0.06) 0%, transparent 60%)" }} className="absolute inset-0" />
      </div>

      {/* Top nav with logo */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-4 border-b border-white/5">
        <LogoLink />
        <Link href="/"
          className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
          ← Back to home
        </Link>
      </nav>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-blue-400 text-sm font-semibold tracking-wide uppercase mb-3">How it Works</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
            From gap to certified.<br />
            <span style={{ background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              In weeks, not years.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            See exactly how ISOComply helps your team achieve and maintain ISO certification.
          </p>
        </div>

        {/* Step selector pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  active === i
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/10"
                }`}>
                <Icon className="size-3.5" />
                <span>{s.step} {s.title.split(" ").slice(0, 3).join(" ")}…</span>
              </button>
            );
          })}
        </div>

        {/* Main content area */}
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 items-center">
          <div>
            <p className="text-blue-400 text-xs font-semibold tracking-widest uppercase mb-3">Step {step.step}</p>
            <h2 className="text-3xl font-bold text-white mb-4 leading-snug"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
              {step.title}
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8">{step.description}</p>

            <div className="flex items-center gap-3 mb-8">
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`transition-all rounded-full ${i === active ? "w-6 h-2.5 bg-blue-500" : "size-2.5 bg-slate-700 hover:bg-slate-500"}`} />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setActive((a) => Math.max(0, a - 1))} disabled={active === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors text-sm disabled:opacity-30">
                <ChevronLeft className="size-4" /> Prev
              </button>
              {active < STEPS.length - 1 ? (
                <button onClick={() => setActive((a) => a + 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-semibold">
                  Next <ChevronRight className="size-4" />
                </button>
              ) : (
                <Link href="/register"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-semibold">
                  Get Started <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>

          <div key={step.id} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {MOCKUPS[step.id]}
          </div>
        </div>

        {/* Checklist bar */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {[
              "A$29/user/mo Starter · A$49 Professional · A$79 Enterprise",
              "Minimum 5 users on all plans",
              "Invite your whole team",
              "Switch plans any time",
              "12-month commitment on annual plans",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle2 className="size-4 text-blue-400 shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
