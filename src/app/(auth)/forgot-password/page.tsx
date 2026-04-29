"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Mail, AlertCircle, CheckCircle2, ArrowRight, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoLink } from "@/components/landing/logo-link";

const COOLDOWN = 60;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startCooldown() {
    setCooldown(COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  async function sendRequest() {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await sendRequest();
      const data = await res.json();
      if (data.notFound) {
        setNotFound(true);
      } else {
        setSubmitted(true);
        startCooldown();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setResendSuccess(false);
    try {
      const res = await sendRequest();
      const data = await res.json();
      if (!data.notFound) {
        setResendSuccess(true);
        startCooldown();
      }
    } catch {
      // silently fail
    } finally {
      setResending(false);
    }
  }

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
              Account recovery
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                made simple
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Enter your email and we&apos;ll send you a secure link to reset your password. The link expires after 1 hour.
            </p>
          </div>
          <ul className="space-y-2.5">
            {[
              "Secure token — expires in 1 hour",
              "No account? The link simply won't arrive",
              "Contact your admin if you've lost MFA access",
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
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
          >
            <ChevronLeft className="size-4" /> Back to sign in
          </Link>

          {submitted ? (
            <div className="text-center">
              <div className="size-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="size-8 text-emerald-500" />
              </div>
              <h1
                className="text-2xl font-bold text-slate-900 mb-2"
                style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
              >
                Check your email
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                If <span className="font-medium text-slate-700">{email}</span>{" "}is registered, you&apos;ll receive a reset link shortly. Check your spam folder if it doesn&apos;t arrive.
              </p>

              <Link
                href="/login"
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors mb-4"
              >
                Back to sign in <ArrowRight className="size-4" />
              </Link>

              <div className="text-sm text-slate-500">
                Didn&apos;t receive it?{" "}
                {cooldown > 0 ? (
                  <span className="text-slate-400">Resend in {cooldown}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    {resending ? "Sending…" : "Resend email"}
                  </button>
                )}
              </div>
              {resendSuccess && (
                <p className="mt-2 text-xs text-emerald-600 flex items-center justify-center gap-1">
                  <CheckCircle2 className="size-3.5" /> Sent! Check your inbox again.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1
                  className="text-2xl font-bold text-slate-900 mb-1"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  Forgot password?
                </h1>
                <p className="text-sm text-slate-500">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}
                {notFound && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-3 text-sm text-amber-700">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>No account found with that email address. <Link href="/register" className="font-semibold underline underline-offset-2">Create an account?</Link></span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      autoComplete="email"
                      autoFocus
                      className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : (
                    <>
                      Send reset link <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

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
