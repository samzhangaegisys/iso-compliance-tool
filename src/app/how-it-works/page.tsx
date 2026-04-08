"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ChevronLeft, ChevronRight,
  ShieldCheck, BarChart3, FileCheck2, ListTodo, FileText,
  CheckCircle2, AlertTriangle, Clock, User, Paperclip,
  TrendingUp, Lock, Bell,
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

// ── App Mockups ────────────────────────────────────────────────────────────────

function DashboardMockup() {
  const standards = [
    { name: "ISO 27001", score: 78, color: "bg-blue-500" },
    { name: "ISO 9001",  score: 91, color: "bg-emerald-500" },
    { name: "ISO 14001", score: 54, color: "bg-amber-500" },
    { name: "ISO 45001", score: 62, color: "bg-orange-400" },
    { name: "ISO 42001", score: 33, color: "bg-red-500" },
  ];
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 text-white text-xs">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700 bg-slate-800">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-500/70" />
          <div className="size-2.5 rounded-full bg-amber-500/70" />
          <div className="size-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-slate-400 text-[10px]">ISOComply — Compliance Dashboard</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Overall Score", value: "72%", color: "text-blue-400" },
            { label: "Controls Met", value: "89/114", color: "text-emerald-400" },
            { label: "Open Tasks", value: "7", color: "text-amber-400" },
          ].map((c) => (
            <div key={c.label} className="rounded-lg bg-slate-800 border border-slate-700 p-2.5 text-center">
              <p className={`text-base font-bold ${c.color}`}>{c.value}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-slate-800 border border-slate-700 p-3 space-y-2.5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Compliance by Standard</p>
          {standards.map((s) => (
            <div key={s.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-300">{s.name}</span>
                <span className="text-[10px] font-bold text-slate-300">{s.score}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-700">
                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.score}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-slate-800 border border-slate-700 p-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Recent Activity</p>
          {[
            { icon: CheckCircle2, text: "Risk assessment uploaded", time: "2h ago", color: "text-emerald-400" },
            { icon: AlertTriangle, text: "Evidence expiring — ISO 9001 §7.5", time: "Yesterday", color: "text-amber-400" },
            { icon: User, text: "Sarah K. assigned to access review", time: "2 days ago", color: "text-blue-400" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-700/50 last:border-0">
              <a.icon className={`size-3 shrink-0 ${a.color}`} />
              <span className="text-[10px] text-slate-300 flex-1 truncate">{a.text}</span>
              <span className="text-[9px] text-slate-500 shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GapMockup() {
  const controls = [
    { ref: "6.1.1", name: "Information security objectives", status: "met", risk: "Low" },
    { ref: "6.1.2", name: "Risk assessment process", status: "partial", risk: "High" },
    { ref: "6.1.3", name: "Statement of Applicability", status: "gap", risk: "Critical" },
    { ref: "7.2",   name: "Competence records", status: "met", risk: "Low" },
    { ref: "8.1",   name: "Operational planning & control", status: "partial", risk: "Medium" },
    { ref: "9.2",   name: "Internal audit programme", status: "gap", risk: "High" },
  ];
  const statusStyle: Record<string, string> = {
    met:     "bg-emerald-900/50 text-emerald-400 border-emerald-700/50",
    partial: "bg-amber-900/50 text-amber-400 border-amber-700/50",
    gap:     "bg-red-900/50 text-red-400 border-red-700/50",
  };
  const statusLabel: Record<string, string> = { met: "Met", partial: "Partial", gap: "Gap" };
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 text-white text-xs">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700 bg-slate-800">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-500/70" />
          <div className="size-2.5 rounded-full bg-amber-500/70" />
          <div className="size-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-slate-400 text-[10px]">ISOComply — Gap Analysis · ISO 27001</span>
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-3">
          {[
            { label: "2 Gaps", color: "bg-red-900/60 text-red-400 border-red-700/50" },
            { label: "2 Partial", color: "bg-amber-900/60 text-amber-400 border-amber-700/50" },
            { label: "2 Met", color: "bg-emerald-900/60 text-emerald-400 border-emerald-700/50" },
          ].map((c) => (
            <span key={c.label} className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${c.color}`}>{c.label}</span>
          ))}
        </div>
        <div className="rounded-lg border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-[2rem_1fr_4rem_4rem] bg-slate-800 px-2 py-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
            <span>Ref</span><span>Control</span><span className="text-center">Status</span><span className="text-center">Risk</span>
          </div>
          {controls.map((c) => (
            <div key={c.ref} className="grid grid-cols-[2rem_1fr_4rem_4rem] px-2 py-1.5 border-t border-slate-700/50 items-center">
              <span className="text-[9px] font-mono text-slate-400">{c.ref}</span>
              <span className="text-[10px] text-slate-300 truncate pr-2">{c.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded border text-center font-semibold ${statusStyle[c.status]}`}>{statusLabel[c.status]}</span>
              <span className="text-[9px] text-slate-400 text-center">{c.risk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EvidenceMockup() {
  const files = [
    { name: "Information Security Policy v2.1.pdf", standard: "ISO 27001", control: "5.2", expires: "Dec 2026", status: "valid" },
    { name: "Risk Register Q1 2026.xlsx", standard: "ISO 27001", control: "6.1.2", expires: "Apr 2026", status: "expiring" },
    { name: "Internal Audit Report Mar 2026.pdf", standard: "ISO 9001", control: "9.2", expires: "Mar 2027", status: "valid" },
    { name: "Environmental Aspects Register.xlsx", standard: "ISO 14001", control: "6.1.2", expires: "Jun 2026", status: "valid" },
  ];
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 text-white text-xs">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700 bg-slate-800">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-500/70" />
          <div className="size-2.5 rounded-full bg-amber-500/70" />
          <div className="size-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-slate-400 text-[10px]">ISOComply — Evidence Vault</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="border-2 border-dashed border-slate-600 rounded-lg py-4 text-center">
          <Paperclip className="size-5 text-slate-500 mx-auto mb-1" />
          <p className="text-[10px] text-slate-400">Drag & drop files, or <span className="text-blue-400">browse</span></p>
          <p className="text-[9px] text-slate-600 mt-0.5">PDF, DOCX, XLSX, PNG up to 50 MB</p>
        </div>
        <div className="rounded-lg border border-slate-700 overflow-hidden">
          <div className="bg-slate-800 px-3 py-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wide flex gap-2">
            <span className="flex-1">Document</span><span className="w-16">Control</span><span className="w-14">Expires</span><span className="w-12 text-right">Status</span>
          </div>
          {files.map((f) => (
            <div key={f.name} className="flex items-center gap-2 px-3 py-2 border-t border-slate-700/50">
              <div className="size-6 rounded bg-blue-900/60 flex items-center justify-center shrink-0">
                <Paperclip className="size-3 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-300 truncate">{f.name}</p>
                <p className="text-[9px] text-slate-500">{f.standard}</p>
              </div>
              <span className="text-[9px] text-slate-500 w-16 shrink-0 font-mono">{f.control}</span>
              <span className="text-[9px] text-slate-500 w-14 shrink-0">{f.expires}</span>
              <span className={`text-[9px] font-semibold w-12 text-right shrink-0 ${f.status === "expiring" ? "text-amber-400" : "text-emerald-400"}`}>
                {f.status === "expiring" ? "Expiring" : "Valid"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksMockup() {
  const tasks = [
    { title: "Complete risk assessment documentation", status: "In Progress", assignee: "SK", color: "bg-blue-500", due: "Apr 12", priority: "HIGH", priorityColor: "text-orange-400" },
    { title: "Update Statement of Applicability", status: "Todo", assignee: "SK", color: "bg-blue-500", due: "May 12", priority: "CRITICAL", priorityColor: "text-red-400" },
    { title: "Conduct internal audit clause 9.2", status: "Todo", assignee: "JO", color: "bg-emerald-500", due: "Apr 18", priority: "HIGH", priorityColor: "text-orange-400" },
    { title: "Update access control matrix", status: "In Review", assignee: "SK", color: "bg-blue-500", due: "May 2", priority: "HIGH", priorityColor: "text-orange-400" },
    { title: "H&S inspection of all work areas", status: "Done", assignee: "TR", color: "bg-purple-500", due: "May 15", priority: "HIGH", priorityColor: "text-orange-400" },
  ];
  const statusPill: Record<string, string> = {
    "Todo":        "bg-slate-700 text-slate-300",
    "In Progress": "bg-blue-900/60 text-blue-400",
    "In Review":   "bg-amber-900/60 text-amber-400",
    "Done":        "bg-emerald-900/60 text-emerald-400",
  };
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 text-white text-xs">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700 bg-slate-800">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-500/70" />
          <div className="size-2.5 rounded-full bg-amber-500/70" />
          <div className="size-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-slate-400 text-[10px]">ISOComply — Tasks</span>
      </div>
      <div className="p-4">
        <div className="rounded-lg border border-slate-700 overflow-hidden">
          <div className="grid grid-cols-[1fr_5rem_4rem_4rem_2rem] bg-slate-800 px-3 py-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
            <span>Task</span><span>Status</span><span>Due</span><span>Priority</span><span></span>
          </div>
          {tasks.map((t, i) => (
            <div key={i} className="grid grid-cols-[1fr_5rem_4rem_4rem_2rem] px-3 py-2 border-t border-slate-700/50 items-center">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`size-5 rounded-full ${t.color} flex items-center justify-center shrink-0`}>
                  <span className="text-[8px] font-bold text-white">{t.assignee}</span>
                </div>
                <span className="text-[10px] text-slate-300 truncate">{t.title}</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium w-fit ${statusPill[t.status]}`}>{t.status}</span>
              <span className="text-[9px] text-slate-500 flex items-center gap-0.5"><Clock className="size-2.5" />{t.due}</span>
              <span className={`text-[9px] font-bold ${t.priorityColor}`}>{t.priority}</span>
              <span />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 text-white text-xs">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700 bg-slate-800">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-500/70" />
          <div className="size-2.5 rounded-full bg-amber-500/70" />
          <div className="size-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-slate-400 text-[10px]">ISOComply — Audit Report Generator</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="rounded-lg border border-slate-700 bg-slate-800 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="size-4 text-blue-400" />
              <span className="text-xs font-bold text-white">ISOComply</span>
            </div>
            <p className="text-sm font-bold text-white">ISO 27001:2022 Audit Report</p>
            <p className="text-[10px] text-blue-300 mt-0.5">Acme Ltd · April 2026</p>
          </div>
          <div className="p-3 space-y-2">
            {[
              { section: "Executive Summary", lines: 2 },
              { section: "Compliance Score", lines: 1 },
              { section: "Controls Assessment", lines: 3 },
              { section: "Evidence Index", lines: 2 },
            ].map((s) => (
              <div key={s.section}>
                <p className="text-[9px] font-semibold text-blue-400 mb-1">{s.section}</p>
                {Array.from({ length: s.lines }).map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full bg-slate-600 mb-1 ${i === s.lines - 1 ? "w-2/3" : "w-full"}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-[10px] font-semibold text-white">
            <TrendingUp className="size-3" /> Download PDF
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-700 text-[10px] font-semibold text-slate-300">
            <Lock className="size-3" /> Share Link
          </button>
        </div>
        <p className="text-center text-[9px] text-slate-500 flex items-center justify-center gap-1">
          <Bell className="size-2.5" /> Report auto-updates when new evidence is added
        </p>
      </div>
    </div>
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
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
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
                  Create Account <ArrowRight className="size-4" />
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
