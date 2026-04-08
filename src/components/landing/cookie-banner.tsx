"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X, Cookie } from "lucide-react";

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    let consent: string | null = null;
    try {
      consent = localStorage.getItem("cookie_consent");
    } catch {
      // localStorage unavailable (e.g. private browsing with strict settings)
    }
    if (consent !== "accepted" && consent !== "rejected") {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss(value: "accepted" | "rejected") {
    setLeaving(true);
    try { localStorage.setItem("cookie_consent", value); } catch { /* ignore */ }
    setTimeout(() => setVisible(false), 350);
  }

  if (!mounted || !visible) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 w-[340px] max-w-[calc(100vw-2.5rem)]"
      style={{
        animation: leaving
          ? "slide-down-out 0.35s ease forwards"
          : "slide-up-in 0.45s cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      {/* Card */}
      <div
        className="rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
        style={{
          background: "rgba(15,23,42,0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Subtle top gradient line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500" />

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
                <Cookie className="size-4 text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-white">Cookie Preferences</p>
            </div>
            <button
              onClick={() => dismiss("rejected")}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors shrink-0 -mt-0.5"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>

          {/* Body text */}
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            We use cookies to personalise content, analyse traffic, and improve your
            experience. See our{" "}
            <Link
              href="/cookies"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>

          {/* Buttons */}
          <div className="flex gap-2.5">
            <button
              onClick={() => dismiss("rejected")}
              className="flex-1 py-2 rounded-xl border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/5 hover:border-white/20 transition-all"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={() => dismiss("accepted")}
              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Accept All
            </button>
          </div>

          {/* Trust note */}
          <div className="flex items-center gap-1.5 mt-3 justify-center">
            <ShieldCheck className="size-3 text-slate-600" />
            <p className="text-[10px] text-slate-600">We never sell your data</p>
          </div>
        </div>
      </div>
    </div>
  );
}
