"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Bell, CheckCircle2, Upload, Sparkles, FileText, AlertTriangle, Clock } from "lucide-react";

// ── Shared sidebar + shell ────────────────────────────────────────────────────

const NAV = [
  { label: "Dashboard",     active: true  },
  { label: "Gap Analysis",  active: false },
  { label: "Evidence Vault",active: false },
  { label: "Controls",      active: false },
  { label: "Reports",       active: false },
  { label: "AI Advisor",    active: false },
  { label: "Team",          active: false },
];

function Shell({ activeNav, children }: { activeNav: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <div className="w-40 bg-white border-r border-slate-200 flex flex-col py-3 shrink-0">
        <div className="flex items-center gap-1.5 px-3 mb-5">
          <ShieldCheck className="size-4 text-blue-600" />
          <span className="text-[11px] font-bold text-slate-800">ISOComply</span>
        </div>
        <nav className="flex flex-col gap-0.5 px-1.5">
          {NAV.map((item) => (
            <div
              key={item.label}
              className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium ${
                item.label === activeNav
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </div>
          ))}
        </nav>
      </div>
      {/* Main */}
      <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
        {children}
      </div>
    </div>
  );
}

// ── Screen 1: Dashboard ───────────────────────────────────────────────────────

function DashboardScreen() {
  const standards = [
    { name: "ISO 27001", pct: 68, color: "#3b82f6", status: "In Progress",    statusCls: "bg-blue-100 text-blue-700"   },
    { name: "ISO 9001",  pct: 84, color: "#22c55e", status: "On Track",        statusCls: "bg-green-100 text-green-700" },
    { name: "ISO 14001", pct: 42, color: "#f59e0b", status: "Needs Attention", statusCls: "bg-amber-100 text-amber-700" },
    { name: "ISO 45001", pct: 91, color: "#10b981", status: "Certified",       statusCls: "bg-emerald-100 text-emerald-700" },
  ];
  const activity = [
    { icon: FileText,      cls: "text-blue-600 bg-blue-50",   text: 'Evidence uploaded for "A.8.7 — Protection against malware"', who: "Sarah K.",  when: "2h ago" },
    { icon: CheckCircle2,  cls: "text-green-600 bg-green-50", text: '"5.2 Quality Policy" marked as Implemented',                 who: "James O.",  when: "4h ago" },
    { icon: AlertTriangle, cls: "text-red-600 bg-red-50",     text: '"4.1 Understanding context" is overdue',                     who: "System",    when: "Yesterday" },
    { icon: Clock,         cls: "text-amber-600 bg-amber-50", text: "New task: Review supplier agreements",                       who: "Admin",     when: "Yesterday" },
  ];
  return (
    <Shell activeNav="Dashboard">
      {/* Header */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] font-semibold text-slate-800">Compliance Overview</p>
          <p className="text-[9px] text-slate-400">4 active standards · Updated just now</p>
        </div>
        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-semibold">71% Ready</span>
      </div>
      {/* Score cards */}
      <div className="px-3 py-2 grid grid-cols-4 gap-1.5 shrink-0">
        {standards.map((s) => (
          <div key={s.name} className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-sm">
            <p className="text-[9px] text-slate-500 mb-0.5">{s.name}</p>
            <p className="text-[15px] font-bold text-slate-800 leading-none mb-1.5">{s.pct}%</p>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
            </div>
            <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${s.statusCls}`}>{s.status}</span>
          </div>
        ))}
      </div>
      {/* Activity */}
      <div className="px-3 pb-2 flex-1 min-h-0 overflow-hidden">
        <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Recent Activity</p>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {activity.map((a, i) => (
            <div key={i} className={`flex items-center gap-2 px-2.5 py-2 text-[10px] ${i < activity.length - 1 ? "border-b border-slate-100" : ""}`}>
              <div className={`size-5 rounded-md flex items-center justify-center shrink-0 ${a.cls}`}>
                <a.icon className="size-2.5" />
              </div>
              <span className="text-slate-600 flex-1 truncate min-w-0">{a.text}</span>
              <span className="text-slate-400 shrink-0 text-[9px]">{a.when}</span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// ── Screen 2: Gap Analysis ────────────────────────────────────────────────────

function GapAnalysisScreen() {
  const gaps = [
    { id: "A.6.1",  name: "Internal organisation",  priority: "HIGH", priorityCls: "bg-red-100 text-red-700"    },
    { id: "A.7.1",  name: "HR security policy",      priority: "MED",  priorityCls: "bg-amber-100 text-amber-700"},
    { id: "A.8.1",  name: "Asset management",        priority: "HIGH", priorityCls: "bg-red-100 text-red-700"    },
    { id: "A.12.1", name: "Operations security",     priority: "LOW",  priorityCls: "bg-slate-100 text-slate-600"},
    { id: "A.13.1", name: "Network controls",        priority: "HIGH", priorityCls: "bg-red-100 text-red-700"    },
  ];
  return (
    <Shell activeNav="Gap Analysis">
      <div className="bg-white px-4 py-2.5 border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[11px] font-semibold text-slate-800">Gap Analysis — ISO 27001:2022</p>
            <p className="text-[9px] text-slate-400">24 gaps identified · 6 critical · Last run: today</p>
          </div>
          <span className="text-[9px] bg-blue-600 text-white px-2 py-1 rounded-md font-medium cursor-pointer">Re-run AI</span>
        </div>
        <div className="flex gap-1.5">
          {["All 24", "Critical 6", "High 8", "Medium 10"].map((f, i) => (
            <span key={f} className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${i === 0 ? "bg-blue-600 text-white" : "text-slate-500 bg-slate-100"}`}>{f}</span>
          ))}
        </div>
      </div>
      <div className="flex-1 px-3 py-2 overflow-hidden flex flex-col gap-2">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-2.5 py-1.5 text-slate-500 font-medium w-14">ID</th>
                <th className="text-left px-2.5 py-1.5 text-slate-500 font-medium">Gap</th>
                <th className="text-left px-2.5 py-1.5 text-slate-500 font-medium w-16">Priority</th>
                <th className="text-left px-2.5 py-1.5 text-slate-500 font-medium w-12">Action</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((g, i) => (
                <tr key={g.id} className={i < gaps.length - 1 ? "border-b border-slate-50" : ""}>
                  <td className="px-2.5 py-1.5 text-blue-600 font-mono font-medium">{g.id}</td>
                  <td className="px-2.5 py-1.5 text-slate-700 truncate max-w-0">{g.name}</td>
                  <td className="px-2.5 py-1.5">
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${g.priorityCls}`}>{g.priority}</span>
                  </td>
                  <td className="px-2.5 py-1.5">
                    <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-md cursor-pointer">Fix</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-start gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2">
          <Sparkles className="size-3 text-violet-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-violet-700 leading-relaxed">
            <span className="font-semibold">AI recommends:</span> Start with A.6.1 — fixing it unblocks 3 dependent controls and cuts risk by 18%.
          </p>
        </div>
      </div>
    </Shell>
  );
}

// ── Screen 3: Evidence Vault ──────────────────────────────────────────────────

function EvidenceScreen() {
  const files = [
    { name: "Info Security Policy v2.1.pdf",  control: "A.5.1",  status: "Valid",    statusCls: "bg-emerald-100 text-emerald-700", expiry: "Dec 2025" },
    { name: "Risk Assessment 2024.xlsx",       control: "A.8.1",  status: "Expiring", statusCls: "bg-amber-100 text-amber-700",    expiry: "14 days"  },
    { name: "Employee NDA Template.docx",      control: "A.7.1",  status: "Valid",    statusCls: "bg-emerald-100 text-emerald-700", expiry: "No expiry"},
    { name: "Access Control Matrix.xlsx",      control: "A.9.1",  status: "Expired",  statusCls: "bg-red-100 text-red-700",        expiry: "Expired"  },
    { name: "Business Continuity Plan.pdf",    control: "A.17.1", status: "Valid",    statusCls: "bg-emerald-100 text-emerald-700", expiry: "Jun 2025" },
  ];
  return (
    <Shell activeNav="Evidence Vault">
      <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[11px] font-semibold text-slate-800">Evidence Vault</p>
          <p className="text-[9px] text-slate-400">47 files · 3 expiring soon · 89% controls linked</p>
        </div>
        <button className="flex items-center gap-1 text-[10px] bg-blue-600 text-white px-2 py-1 rounded-md font-medium">
          <Upload className="size-2.5" /> Upload
        </button>
      </div>
      <div className="flex-1 px-3 py-2 overflow-hidden flex flex-col gap-2">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {files.map((f, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-2.5 py-2 text-[10px] ${i < files.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <FileText className="size-3 text-slate-400 shrink-0" />
              <span className="text-slate-700 flex-1 truncate min-w-0">{f.name}</span>
              <span className="text-blue-600 font-mono font-medium shrink-0 text-[9px]">{f.control}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-semibold shrink-0 ${f.statusCls}`}>
                {f.expiry}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle className="size-3 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 leading-relaxed">
            <span className="font-semibold">Reminder:</span> Access Control Matrix expired — re-upload before your next audit.
          </p>
        </div>
      </div>
    </Shell>
  );
}

// ── Screen 4: AI Advisor ──────────────────────────────────────────────────────

function AIAdvisorScreen() {
  const messages = [
    { from: "ai",   text: "Good morning! You have 3 high-priority gaps in ISO 27001. I recommend starting with A.6.1 — fixing it unblocks 3 dependent controls." },
    { from: "user", text: "What evidence do I need for A.6.1?" },
    { from: "ai",   text: "For A.6.1 you'll need: ① Documented org structure ② Signed role definitions ③ Management approval record. I can generate a task list now." },
  ];
  return (
    <Shell activeNav="AI Advisor">
      <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex items-center gap-2.5 shrink-0">
        <div className="size-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
          <Sparkles className="size-3.5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-slate-800">AI Compliance Advisor</p>
          <p className="text-[9px] text-slate-400">Powered by ISOComply Intelligence</p>
        </div>
        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Online</span>
      </div>
      <div className="flex-1 px-3 py-2.5 space-y-2 overflow-hidden bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} gap-2`}>
            {m.from === "ai" && (
              <div className="size-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="size-2.5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-xl px-2.5 py-2 text-[10px] leading-relaxed shadow-sm ${
                m.from === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white text-slate-700 rounded-bl-sm border border-slate-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div className="flex gap-1.5 flex-wrap pt-1">
          {["Generate task list", "View all gaps", "Upload evidence"].map((a) => (
            <span
              key={a}
              className="text-[9px] border border-blue-200 text-blue-600 px-2 py-1 rounded-full bg-blue-50 cursor-pointer"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
      <div className="px-3 pb-3 shrink-0 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 mt-2">
          <span className="text-[10px] text-slate-400 flex-1">Ask me anything about ISO compliance…</span>
          <div className="size-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-[9px] text-white font-bold">→</span>
          </div>
        </div>
      </div>
    </Shell>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

const SCREENS = [
  { label: "Dashboard",      url: "app.isocomply.io/dashboard",    Component: DashboardScreen   },
  { label: "Gap Analysis",   url: "app.isocomply.io/gap-analysis", Component: GapAnalysisScreen },
  { label: "Evidence Vault", url: "app.isocomply.io/evidence",     Component: EvidenceScreen    },
  { label: "AI Advisor",     url: "app.isocomply.io/ai-advisor",   Component: AIAdvisorScreen   },
];

export function AppScreensSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SCREENS.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative select-none">
      {/* Tabs */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {SCREENS.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200"
            style={{
              background: i === active ? "#2563eb" : "rgba(255,255,255,0.06)",
              color: i === active ? "#fff" : "#94a3b8",
              border: i === active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: i === active ? "0 0 18px rgba(59,130,246,0.4)" : "none",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Browser window */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.07)",
        }}
      >
        {/* Chrome bar — light browser style */}
        <div className="bg-[#e8eaed] px-3 py-2 flex items-center gap-2.5">
          <div className="flex gap-1.5 shrink-0">
            <div className="size-2.5 rounded-full bg-[#ff5f57]" />
            <div className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-md px-3 py-0.5 text-[11px] text-slate-500 w-56 text-center shadow-sm border border-slate-200/80 transition-all duration-500">
              {SCREENS[active].url}
            </div>
          </div>
          <Bell className="size-3 text-slate-400 shrink-0" />
        </div>

        {/* Screen area — height scales with viewport so it fills the hero column */}
        <div className="relative overflow-hidden" style={{ height: "clamp(320px, 44vh, 520px)" }}>
          {SCREENS.map(({ Component }, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-all duration-500"
              style={{
                opacity: i === active ? 1 : 0,
                transform: i === active
                  ? "translateX(0) scale(1)"
                  : i < active
                  ? "translateX(-14px) scale(0.99)"
                  : "translateX(14px) scale(0.99)",
                pointerEvents: i === active ? "auto" : "none",
              }}
            >
              <Component />
            </div>
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {SCREENS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Show ${SCREENS[i].label}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === active ? "1.75rem" : "0.375rem",
              background: i === active ? "#60a5fa" : "rgba(100,116,139,0.35)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
