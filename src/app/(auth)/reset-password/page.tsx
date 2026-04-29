"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, AlertCircle, CheckCircle2, ArrowRight, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoLink } from "@/components/landing/logo-link";
import { getPasswordChecks } from "@/lib/password-checks";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const checks = getPasswordChecks(password);
  const allPassing = checks.every((c) => c.pass);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allPassing) {
      setError("Please meet all password requirements.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setDone(true);
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="size-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="size-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          Invalid link
        </h1>
        <p className="text-sm text-slate-500 mb-8">This reset link is missing or malformed.</p>
        <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
      >
        <ChevronLeft className="size-4" /> Back to sign in
      </Link>

      {done ? (
        <div className="text-center">
          <div className="size-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="size-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
            Password updated!
          </h1>
          <p className="text-sm text-slate-500 mb-8">Your password has been reset. Redirecting you to sign in…</p>
          <Link
            href="/login"
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Sign in now <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
              Set new password
            </h1>
            <p className="text-sm text-slate-500">Choose a strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                  autoComplete="new-password"
                  className="pl-10 pr-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {password.length > 0 && (
              <ul className="space-y-1 px-1">
                {checks.map((c) => (
                  <li key={c.label} className={`flex items-center gap-2 text-xs ${c.pass ? "text-emerald-600" : "text-slate-400"}`}>
                    <CheckCircle2 className={`size-3.5 shrink-0 ${c.pass ? "text-emerald-500" : "text-slate-300"}`} />
                    {c.label}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="submit"
              disabled={loading || !allPassing}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                <>Set password <ArrowRight className="size-4" /></>
              )}
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left branded panel */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "#0a0f1e" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.10) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(99,102,241,0.8) 39px, rgba(99,102,241,0.8) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(99,102,241,0.8) 39px, rgba(99,102,241,0.8) 40px)",
          }}
        />
        <LogoLink size="md" />
        <div className="relative flex-1 flex flex-col justify-center gap-6 py-12">
          <div>
            <h2
              className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Almost back
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                in your workspace
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Choose a strong new password. Your previous sessions will remain active.
            </p>
          </div>
          <ul className="space-y-2.5">
            {[
              "At least 12 characters",
              "One uppercase letter",
              "One number",
              "One special character",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
                <CheckCircle2 className="size-4 text-blue-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
          <ShieldCheck className="size-7 text-blue-600" />
          <span className="text-xl font-bold text-slate-900">ISOComply</span>
        </Link>

        <div className="w-full max-w-sm">
          <Suspense>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-8 flex items-center justify-center gap-4">
            {["SOC 2 Type II", "GDPR Ready", "256-bit Encryption"].map((t) => (
              <div key={t} className="flex items-center gap-1 text-[10px] text-slate-400">
                <ShieldCheck className="size-3 text-slate-300" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
