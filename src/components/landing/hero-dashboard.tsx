"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  ShieldCheck,
  Bell,
  CheckCircle2,
  Upload,
  Sparkles,
  FileText,
  AlertTriangle,
  Clock,
  BarChart3,
  FileCheck2,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "dashboard" | "gap" | "evidence" | "ai";

// ─── Sub-views ────────────────────────────────────────────────────────────────

function DashboardView({ active }: { active: boolean }) {
  const targets = [68, 84, 42, 91];
  const [widths, setWidths] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (!active) {
      setWidths([0, 0, 0, 0]);
      return;
    }
    const timer = setTimeout(() => {
      setWidths(targets);
    }, 120);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const standards = [
    { name: "ISO 27001", pct: 68, color: "#3b82f6", status: "In Progress", statusColor: "#3b82f6" },
    { name: "ISO 9001",  pct: 84, color: "#10b981", status: "On Track",    statusColor: "#10b981" },
    { name: "ISO 14001", pct: 42, color: "#f59e0b", status: "Needs Work",  statusColor: "#f59e0b" },
    { name: "ISO 45001", pct: 91, color: "#8b5cf6", status: "Near Ready",  statusColor: "#8b5cf6" },
  ];

  const activity = [
    { icon: <CheckCircle2 size={9} color="#10b981" />, text: "Access control policy approved", time: "2 min ago" },
    { icon: <FileCheck2  size={9} color="#3b82f6" />, text: "Evidence uploaded: ISMS-Scope.pdf", time: "18 min ago" },
    { icon: <AlertTriangle size={9} color="#f59e0b" />, text: "Risk assessment due in 3 days", time: "1 hr ago" },
    { icon: <Users size={9} color="#8b5cf6" />, text: "New team member added", time: "Yesterday" },
  ];

  return (
    <div style={{ display: "flex", height: "100%", background: "#fff" }}>
      {/* Sidebar */}
      <div style={{ width: 112, background: "#f8fafc", borderRight: "1px solid #e2e8f0", padding: "10px 0", flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ padding: "0 10px 8px", borderBottom: "1px solid #e2e8f0", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ShieldCheck size={11} color="#3b82f6" />
            <span style={{ fontSize: 9, fontWeight: 700, color: "#1e293b" }}>ISOComply</span>
          </div>
        </div>
        {[
          { label: "Dashboard", icon: <BarChart3 size={9} />, active: true },
          { label: "Gap Analysis", icon: <AlertTriangle size={9} />, active: false },
          { label: "Evidence", icon: <FileText size={9} />, active: false },
          { label: "AI Advisor", icon: <Sparkles size={9} />, active: false },
          { label: "Reports", icon: <FileCheck2 size={9} />, active: false },
          { label: "Team", icon: <Users size={9} />, active: false },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 10px",
              borderRadius: 4,
              margin: "0 6px",
              background: item.active ? "#eff6ff" : "transparent",
              color: item.active ? "#2563eb" : "#64748b",
              fontSize: 9,
              fontWeight: item.active ? 600 : 400,
              cursor: "default",
            }}
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "10px 12px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>Compliance Overview</span>
          <span style={{ fontSize: 9, fontWeight: 600, background: "#eff6ff", color: "#2563eb", padding: "2px 7px", borderRadius: 999, border: "1px solid #bfdbfe" }}>
            71% Audit Ready
          </span>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }}>
          {standards.map((s, i) => (
            <div
              key={s.name}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                padding: "7px 8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 600, color: "#475569", marginBottom: 3 }}>{s.name}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{s.pct}%</div>
              <div style={{ height: 3, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                <div
                  style={{
                    height: "100%",
                    width: `${widths[i]}%`,
                    background: s.color,
                    borderRadius: 99,
                    transition: "width 1.2s ease-out",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 600,
                  color: s.statusColor,
                  background: `${s.statusColor}18`,
                  padding: "1px 5px",
                  borderRadius: 999,
                }}
              >
                {s.status}
              </span>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ padding: "5px 8px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: "#475569" }}>Recent Activity</span>
          </div>
          {activity.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 8px",
                borderBottom: i < activity.length - 1 ? "1px solid #f8fafc" : "none",
                background: "#fff",
                cursor: "default",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#eff6ff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}
            >
              <div style={{ flexShrink: 0 }}>{item.icon}</div>
              <span style={{ fontSize: 9, color: "#334155", flex: 1 }}>{item.text}</span>
              <span style={{ fontSize: 8, color: "#94a3b8", flexShrink: 0 }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GapAnalysisView() {
  const [activeFilter, setActiveFilter] = useState<"all" | "critical" | "high" | "medium">("all");

  const gaps = [
    { id: "A.9.1.1", name: "Access Control Policy",           priority: "Critical", priorityColor: "#ef4444", priorityBg: "#fef2f2" },
    { id: "A.12.6.1", name: "Management of Technical Vulns",  priority: "High",     priorityColor: "#f97316", priorityBg: "#fff7ed" },
    { id: "A.14.2.1", name: "Secure Development Policy",      priority: "High",     priorityColor: "#f97316", priorityBg: "#fff7ed" },
    { id: "A.6.1.2",  name: "Segregation of Duties",          priority: "Medium",   priorityColor: "#eab308", priorityBg: "#fefce8" },
    { id: "A.11.1.1", name: "Physical Security Perimeter",    priority: "Critical", priorityColor: "#ef4444", priorityBg: "#fef2f2" },
  ];

  const filters = [
    { key: "all",      label: "All 24" },
    { key: "critical", label: "Critical 6" },
    { key: "high",     label: "High 8" },
    { key: "medium",   label: "Medium 10" },
  ] as const;

  const filtered = gaps.filter((g) => {
    if (activeFilter === "all") return true;
    return g.priority.toLowerCase() === activeFilter;
  });

  return (
    <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column", padding: "10px 12px", gap: 8 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>Gap Analysis — ISO 27001:2022</span>
        <span style={{ fontSize: 9, fontWeight: 600, background: "#fef2f2", color: "#ef4444", padding: "2px 7px", borderRadius: 999, border: "1px solid #fecaca" }}>
          24 gaps
        </span>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 5 }}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{
              fontSize: 8, fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 999,
              border: activeFilter === f.key ? "1px solid #3b82f6" : "1px solid #e2e8f0",
              background: activeFilter === f.key ? "#eff6ff" : "#f8fafc",
              color: activeFilter === f.key ? "#2563eb" : "#64748b",
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden", flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 60px 44px", padding: "4px 8px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          {["ID", "Control Name", "Priority", ""].map((h) => (
            <span key={h} style={{ fontSize: 8, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>
        {filtered.map((gap, i) => (
          <div
            key={gap.id}
            style={{
              display: "grid", gridTemplateColumns: "60px 1fr 60px 44px",
              padding: "5px 8px",
              alignItems: "center",
              borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none",
              background: "#fff",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}
          >
            <span style={{ fontSize: 8, color: "#94a3b8", fontFamily: "monospace" }}>{gap.id}</span>
            <span style={{ fontSize: 9, color: "#1e293b", fontWeight: 500 }}>{gap.name}</span>
            <span style={{ fontSize: 8, fontWeight: 600, color: gap.priorityColor, background: gap.priorityBg, padding: "1px 5px", borderRadius: 999, display: "inline-block" }}>
              {gap.priority}
            </span>
            <button style={{ fontSize: 8, fontWeight: 600, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}>
              Fix
            </button>
          </div>
        ))}
      </div>

      {/* AI box */}
      <div style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", border: "1px solid #ddd6fe", borderRadius: 6, padding: "7px 10px", display: "flex", gap: 7, alignItems: "flex-start" }}>
        <Sparkles size={11} color="#7c3aed" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#5b21b6", marginBottom: 2 }}>AI Recommendation</div>
          <div style={{ fontSize: 8, color: "#6d28d9", lineHeight: 1.5 }}>
            Prioritise A.9.1.1 — an access control policy is prerequisite for 12 other controls. Resolving it could raise your score by ~8%.
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidenceView() {
  const files = [
    { name: "ISMS_Scope_v3.pdf",             size: "1.2 MB", status: "Valid",    statusColor: "#10b981", statusBg: "#ecfdf5" },
    { name: "Risk_Assessment_2024.xlsx",      size: "840 KB", status: "Expiring", statusColor: "#f97316", statusBg: "#fff7ed" },
    { name: "Access_Control_Policy_v2.pdf",   size: "2.1 MB", status: "Valid",    statusColor: "#10b981", statusBg: "#ecfdf5" },
    { name: "Incident_Response_Plan.docx",    size: "560 KB", status: "Expired",  statusColor: "#ef4444", statusBg: "#fef2f2" },
    { name: "Business_Continuity_Plan.pdf",   size: "3.4 MB", status: "Valid",    statusColor: "#10b981", statusBg: "#ecfdf5" },
  ];

  return (
    <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column", padding: "10px 12px", gap: 8 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>Evidence Vault</span>
        <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 600, background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, padding: "4px 8px", cursor: "pointer" }}>
          <Upload size={9} />
          Upload
        </button>
      </div>

      {/* File list */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden", flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 55px", padding: "4px 8px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          {["File Name", "Size", "Status"].map((h) => (
            <span key={h} style={{ fontSize: 8, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>
        {files.map((file, i) => (
          <div
            key={file.name}
            style={{
              display: "grid", gridTemplateColumns: "1fr 50px 55px",
              padding: "5px 8px",
              alignItems: "center",
              borderBottom: i < files.length - 1 ? "1px solid #f8fafc" : "none",
              background: "#fff",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <FileText size={9} color="#94a3b8" />
              <span style={{ fontSize: 9, color: "#334155" }}>{file.name}</span>
            </div>
            <span style={{ fontSize: 8, color: "#94a3b8" }}>{file.size}</span>
            <span style={{ fontSize: 8, fontWeight: 600, color: file.statusColor, background: file.statusBg, padding: "1px 5px", borderRadius: 999, display: "inline-block" }}>
              {file.status}
            </span>
          </div>
        ))}
      </div>

      {/* Warning */}
      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "6px 10px", display: "flex", gap: 6, alignItems: "center" }}>
        <AlertTriangle size={10} color="#ef4444" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 8, color: "#991b1b", fontWeight: 500 }}>
          <strong>Incident_Response_Plan.docx</strong> has expired. Upload a new version to maintain compliance.
        </span>
      </div>
    </div>
  );
}

function AIAdvisorView() {
  const messages = [
    {
      role: "ai",
      text: "Hello! I'm your AI compliance advisor. I've analysed your ISO 27001 gaps and have some recommendations ready.",
    },
    {
      role: "user",
      text: "What's the fastest way to improve our audit readiness score?",
    },
    {
      role: "ai",
      text: "Your quickest wins are: (1) Close gap A.9.1.1 — Access Control Policy (+8%), (2) Renew your Risk Assessment document (+5%), and (3) Complete supplier review (+4%). Together these push you from 68% → 85%.",
    },
  ];

  const chips = ["Show critical gaps", "Generate report", "Evidence checklist"];

  return (
    <div style={{ height: "100%", background: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "10px 12px 6px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={10} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#0f172a" }}>AI Advisor</div>
          <div style={{ fontSize: 8, color: "#10b981" }}>● Online</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 7, overflowY: "auto" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "6px 9px",
                borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background: msg.role === "user" ? "#2563eb" : "#f8fafc",
                color: msg.role === "user" ? "#fff" : "#1e293b",
                fontSize: 9,
                lineHeight: 1.5,
                border: msg.role === "ai" ? "1px solid #e2e8f0" : "none",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick replies */}
      <div style={{ padding: "0 12px 5px", display: "flex", gap: 4, flexWrap: "wrap" }}>
        {chips.map((chip) => (
          <button
            key={chip}
            style={{
              fontSize: 8, fontWeight: 500,
              padding: "2px 8px",
              borderRadius: 999,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#475569",
              cursor: "pointer",
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "5px 10px 8px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 5 }}>
        <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 8px", fontSize: 9, color: "#94a3b8" }}>
          Ask about your compliance...
        </div>
        <button style={{ background: "#2563eb", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
          <Sparkles size={9} color="#fff" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function HeroDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const manualRef = useRef(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "gap",       label: "Gap Analysis" },
    { key: "evidence",  label: "Evidence" },
    { key: "ai",        label: "AI Advisor" },
  ];

  const tabOrder: Tab[] = ["dashboard", "gap", "evidence", "ai"];

  const startAutocycle = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      if (manualRef.current) return;
      setActiveTab((prev) => {
        const idx = tabOrder.indexOf(prev);
        return tabOrder[(idx + 1) % tabOrder.length];
      });
    }, 6000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    startAutocycle();
    return () => {
      clearTimeout(t);
      if (autoRef.current) clearInterval(autoRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTabClick(key: Tab) {
    manualRef.current = true;
    setActiveTab(key);
    if (autoRef.current) clearInterval(autoRef.current);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>

      {/* Tab nav above browser */}
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 12 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              style={{
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                padding: "6px 16px",
                borderRadius: 8,
                border: "none",
                background: isActive ? "#2563eb" : "#1e293b",
                color: isActive ? "#fff" : "#94a3b8",
                cursor: "pointer",
                boxShadow: isActive ? "0 0 0 3px rgba(37,99,235,0.3), 0 2px 8px rgba(37,99,235,0.4)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Browser window wrapper */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.07)",
          transform: hovered ? "scale(1.005)" : "scale(1)",
          transition: "transform 0.3s ease",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Chrome bar */}
        <div
          style={{
            background: "#e8eaed",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid #d1d5db",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c940" }} />
          </div>
          {/* URL bar */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 5,
              padding: "3px 10px",
              fontSize: 10,
              color: "#6b7280",
              border: "1px solid #d1d5db",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <ShieldCheck size={9} color="#2563eb" />
            app.isocomply.io
          </div>
        </div>

        {/* Dashboard viewport */}
        <div style={{ height: 480, overflow: "hidden", background: "#fff" }}>
          {activeTab === "dashboard" && <DashboardView active={activeTab === "dashboard"} />}
          {activeTab === "gap"       && <GapAnalysisView />}
          {activeTab === "evidence"  && <EvidenceView />}
          {activeTab === "ai"        && <AIAdvisorView />}
        </div>
      </div>

      {/* ── Floating card 1 — Top-left ──────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: -8,
          zIndex: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(0)" : "translateX(-20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          transitionDelay: "800ms",
        }}
      >
        <div
          style={{
            background: "#fff",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            borderRadius: 12,
            padding: "10px 12px",
            width: 208,
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#ecfdf5", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={11} color="#10b981" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#065f46" }}>Gap Analysis Complete</span>
          </div>
          <span style={{ fontSize: 10, color: "#64748b" }}>ISO 27001 · 68% audit-ready</span>
        </div>
      </div>

      {/* ── Floating card 2 — Bottom-right ─────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: -8,
          zIndex: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(0)" : "translateX(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          transitionDelay: "1200ms",
        }}
      >
        <div
          style={{
            background: "#fff",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
            borderRadius: 12,
            padding: "10px 12px",
            width: 224,
            border: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={13} color="#2563eb" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", marginBottom: 1 }}>Audit Report Generated</div>
              <div style={{ fontSize: 9, color: "#64748b" }}>Access_Control_Policy_v2.pdf</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating card 3 — Top-right ────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 44,
          right: -8,
          zIndex: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          transitionDelay: "1600ms",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            boxShadow: "0 8px 30px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
            borderRadius: 12,
            padding: "10px 12px",
            width: 192,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <Bell size={11} color="#60a5fa" />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#f1f5f9" }}>Evidence expires in 7 days</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Clock size={9} color="#64748b" />
            <span style={{ fontSize: 9, color: "#94a3b8" }}>Risk Assessment 2024.xlsx</span>
          </div>
        </div>
      </div>
    </div>
  );
}
