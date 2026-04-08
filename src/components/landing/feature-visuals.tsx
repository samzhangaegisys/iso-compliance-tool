"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Upload, AlertTriangle } from "lucide-react";

function GapAnalysisVisual() {
  const controls = [
    { id: "A.5.1", name: "InfoSec policies", pct: 100, status: "Implemented" },
    { id: "A.6.1", name: "Internal organisation", pct: 65, status: "In Progress" },
    { id: "A.7.1", name: "HR security", pct: 40, status: "In Progress" },
    { id: "A.8.1", name: "Asset management", pct: 0, status: "Not Started" },
    { id: "A.9.1", name: "Access control", pct: 100, status: "Implemented" },
  ];

  const [score, setScore] = useState(54);

  useEffect(() => {
    const id = setInterval(() => {
      setScore((s) => (s >= 68 ? 54 : s + 1));
    }, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900 overflow-hidden">
      <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
        <span className="text-xs font-semibold text-white">Gap Analysis · ISO 27001</span>
        <span className="text-xs font-bold text-blue-400">{score}% Complete</span>
      </div>
      <div className="p-4 space-y-3">
        {controls.map((c) => (
          <div key={c.id} className="flex items-center gap-3">
            <span className="text-[10px] text-blue-400 font-mono w-10 shrink-0">{c.id}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-300 truncate">{c.name}</span>
                <span
                  className={`text-[9px] ml-2 shrink-0 font-medium ${
                    c.status === "Implemented"
                      ? "text-emerald-400"
                      : c.status === "In Progress"
                      ? "text-blue-400"
                      : "text-slate-500"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    c.status === "Implemented"
                      ? "bg-emerald-500"
                      : c.status === "In Progress"
                      ? "bg-blue-500"
                      : "bg-slate-600"
                  }`}
                  style={{ width: `${c.pct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4">
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 flex items-start gap-2">
          <AlertTriangle className="size-3.5 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-300">
            3 high-priority gaps require immediate attention
          </p>
        </div>
      </div>
    </div>
  );
}

function EvidenceVaultVisual() {
  const allFiles = [
    { name: "InfoSec-Policy-v3.pdf", size: "2.4 MB", tag: "Policy", color: "text-red-400" },
    { name: "Risk-Assessment-2024.xlsx", size: "1.8 MB", tag: "Assessment", color: "text-emerald-400" },
    { name: "Access-Control-Procedure.docx", size: "842 KB", tag: "Procedure", color: "text-blue-400" },
    { name: "ISMS-Scope-Statement.pdf", size: "1.1 MB", tag: "Policy", color: "text-red-400" },
  ];

  const [visibleCount, setVisibleCount] = useState(3);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Track every timer so cleanup cancels them all — prevents double-run flicker in React 18 Strict Mode
    const timers: ReturnType<typeof setTimeout>[] = [];
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const addTimeout = (fn: () => void, ms: number) => {
      const id = setTimeout(() => { if (!cancelled) fn(); }, ms);
      timers.push(id);
    };

    const startCycle = () => {
      if (cancelled) return;
      setUploading(true);
      setUploadPct(0);
      let pct = 0;
      intervalId = setInterval(() => {
        if (cancelled) { if (intervalId) clearInterval(intervalId); return; }
        pct = Math.min(pct + 6, 100);
        setUploadPct(pct);
        if (pct >= 100) {
          if (intervalId) clearInterval(intervalId);
          addTimeout(() => {
            setUploading(false);
            setVisibleCount(4);
            addTimeout(() => {
              setVisibleCount(3);
              addTimeout(startCycle, 1500);
            }, 3000);
          }, 400);
        }
      }, 80);
    };

    addTimeout(startCycle, 800);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900 overflow-hidden">
      <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
        <span className="text-xs font-semibold text-white">Evidence Vault</span>
        <span className="text-[10px] text-slate-400">47 files · 128 MB used</span>
      </div>
      <div className="p-4">
        {uploading && (
          <div className="mb-3 rounded-lg bg-blue-600/10 border border-blue-500/20 p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-blue-300 flex items-center gap-1.5">
                <Upload className="size-3" /> Uploading ISMS-Scope-Statement.pdf
              </span>
              <span className="text-[10px] text-blue-400 font-medium">{uploadPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-75"
                style={{ width: `${uploadPct}%` }}
              />
            </div>
          </div>
        )}
        <div className="space-y-2">
          {allFiles.slice(0, visibleCount).map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/60 border border-slate-700/40"
            >
              <FileText className={`size-4 shrink-0 ${f.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-200 truncate font-medium">{f.name}</p>
                <p className="text-[9px] text-slate-500">{f.size}</p>
              </div>
              <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded shrink-0">
                {f.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuditReportVisual() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Use refs so that any in-flight callback always has the latest handle to cancel
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      setPct(0);
      setDone(false);
      let counter = 0;
      intervalId = setInterval(() => {
        if (cancelled) { if (intervalId) clearInterval(intervalId); return; }
        counter = Math.min(counter + 3, 100);
        setPct(counter);
        if (counter >= 100) {
          if (intervalId) clearInterval(intervalId);
          setDone(true);
          timeoutId = setTimeout(runCycle, 3500);
        }
      }, 80);
    };

    timeoutId = setTimeout(runCycle, 500);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const steps = ["Compiling 114 controls", "Attaching evidence files", "Formatting report"];

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900 overflow-hidden">
      <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
        <span className="text-xs font-semibold text-white">Audit Report Generator</span>
        <span className="text-[10px] text-emerald-400">ISO 27001:2022</span>
      </div>
      <div className="p-4">
        {!done ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-300">Generating audit report…</span>
              <span className="text-[10px] text-blue-400 font-medium">{pct}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-75"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="space-y-2.5">
              {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-2.5">
                  {pct > (i + 1) * 28 ? (
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="size-3.5 rounded-full border border-slate-600 shrink-0" />
                  )}
                  <span
                    className={`text-[10px] ${
                      pct > (i + 1) * 28 ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium">
                Report ready — 847 KB PDF
              </span>
            </div>
            <div className="border border-slate-700/50 rounded-lg overflow-hidden">
              <div className="bg-slate-800/80 px-3 py-2 flex items-center gap-2">
                <FileText className="size-3.5 text-red-400" />
                <span className="text-[10px] text-slate-300 font-medium">
                  ISO_27001_Audit_Report_2024.pdf
                </span>
              </div>
              {[
                "Executive Summary",
                "Control Status Matrix",
                "Evidence Index",
                "Gap Analysis",
                "Remediation Roadmap",
              ].map((section) => (
                <div
                  key={section}
                  className="flex items-center gap-2 px-3 py-1.5 border-t border-slate-800"
                >
                  <div className="size-1.5 rounded-full bg-blue-500/60 shrink-0" />
                  <span className="text-[9px] text-slate-400">{section}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function FeatureVisual({ index }: { index: number }) {
  if (index === 0) return <GapAnalysisVisual />;
  if (index === 1) return <EvidenceVaultVisual />;
  return <AuditReportVisual />;
}
