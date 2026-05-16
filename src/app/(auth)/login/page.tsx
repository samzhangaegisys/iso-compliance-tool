"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  ChevronLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoLink } from "@/components/landing/logo-link";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";

// -- Mini animated compliance score widget shown on the left panel --
function ScoreWidget() {
  const standards = [
    { label: "ISO 27001", pct: 68, color: "bg-blue-500" },
    { label: "ISO 9001", pct: 84, color: "bg-emerald-500" },
    { label: "ISO 14001", pct: 42, color: "bg-amber-500" },
    { label: "ISO 45001", pct: 91, color: "bg-violet-500" },
  ];
  const [bars, setBars] = useState(standards.map(() => 0));

  useEffect(() => {
    const t = setTimeout(() => {
      standards.forEach((s, i) => {
        setTimeout(() => {
          setBars((prev) => {
            const next = [...prev];
            next[i] = s.pct;
            return next;
          });
        }, i * 150);
      });
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-white/90">Compliance Overview</p>
          <p className="text-[10px] text-white/40 mt-0.5">Last updated just now</p>
        </div>
        <span className="text-xs font-bold text-blue-400 bg-blue-500/15 px-2.5 py-1 rounded-full">
          Live
        </span>
      </div>
      <div className="space-y-3">
        {standards.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-white/70 font-medium">{s.label}</span>
              <span className="text-[11px] text-white/60 font-mono">{s.pct}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${s.color} rounded-full`}
                style={{
                  width: `${bars[i]}%`,
                  transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-emerald-400" />
          <span className="text-[10px] text-white/50">12 controls completed this week</span>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const justRegistered = searchParams.get("registered") === "1";
  const prefilledEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captchaToken) {
      setError("Please complete the human verification below.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Check if MFA is required for this account
      const checkRes = await fetch("/api/mfa/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const { mfaRequired } = await checkRes.json();

      if (mfaRequired) {
        setStep("mfa");
        setLoading(false);
        return;
      }

      // No MFA — sign in directly
      const result = await signIn("credentials", {
        email,
        password,
        captchaToken,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        setCaptchaToken("");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (totpCode.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        totpCode,
        captchaToken,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid authenticator code. Please try again.");
        setTotpCode("");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex">
      {/* -- Left panel: branded -- */}
      <div
        className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "#0a0f1e" }}
      >
        {/* Background layers */}
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

        {/* Logo */}
        <LogoLink size="md" />

        {/* Centre content */}
        <div className="relative flex-1 flex flex-col justify-center gap-8 py-12">
          <div>
            <h2
              className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Your compliance
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                command centre
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Everything your team needs to get ISO audit-ready — gap analysis, evidence management, and audit reports — in one place.
            </p>
          </div>

          {/* Animated widget */}
          <ScoreWidget />

          {/* Feature bullets */}
          <ul className="space-y-2.5">
            {[
              "Gap analysis across 5 ISO standards",
              "Evidence vault with auto-expiry reminders",
              "One-click audit report generation",
              "Real-time team task management",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
                <CheckCircle2 className="size-4 text-blue-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* -- Right panel: form -- */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
          <ShieldCheck className="size-7 text-blue-600" />
          <span className="text-xl font-bold text-slate-900">ISOComply</span>
        </Link>

        <div className="w-full max-w-sm">
          {step === "credentials" ? (
            <>
              {/* Registration success banner */}
              {justRegistered && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700 mb-5">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <span>Account created! Sign in below to access your workspace.</span>
                </div>
              )}
              {/* Heading */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
                  Welcome back
                </h1>
                <p className="text-sm text-slate-500">Sign in to your compliance workspace</p>
              </div>

              {/* Google sign-in */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors disabled:opacity-50 mb-6 shadow-sm"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">or continue with email</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com" required autoComplete="email"
                      className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                    <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" required autoComplete="current-password"
                      className="pl-10 h-11 rounded-xl border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                  </div>
                </div>

                {/* Human verification */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Human verification</Label>
                  <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken("")} />
                </div>

                <button type="submit" disabled={loading || !captchaToken}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : (<>Sign in <ArrowRight className="size-4" /></>)}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Create one</Link>
              </p>
            </>
          ) : (
            /* ---- MFA Step ---- */
            <>
              <button onClick={() => { setStep("credentials"); setError(null); setTotpCode(""); }}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors">
                <ChevronLeft className="size-4" /> Back
              </button>

              <div className="mb-8 flex flex-col items-center text-center">
                <div className="size-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Smartphone className="size-7 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
                  Two-factor authentication
                </h1>
                <p className="text-sm text-slate-500 max-w-xs">
                  Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, 1Password, etc.)
                </p>
              </div>

              <form onSubmit={handleMfaSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="totp" className="text-sm font-medium text-slate-700">Authenticator code</Label>
                  <Input
                    id="totp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000 000"
                    autoFocus
                    required
                    className="h-14 rounded-xl border-slate-200 text-center text-2xl font-mono tracking-widest focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button type="submit" disabled={loading || totpCode.length !== 6}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying…
                    </span>
                  ) : (<>Verify & sign in <ArrowRight className="size-4" /></>)}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-400">
                Lost access to your authenticator? Contact your admin.
              </p>
            </>
          )}

          {/* Trust badges — always visible */}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
