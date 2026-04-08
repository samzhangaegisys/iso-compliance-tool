"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Building2,
  Smartphone,
  CreditCard,
  Check,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoLink } from "@/components/landing/logo-link";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { getPasswordChecks, isPasswordStrong } from "@/lib/password";

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = "starter" | "professional" | "enterprise";

interface RegState {
  // Step 1 – plan
  plan: Plan;
  // Step 2 – account
  name: string;
  email: string;
  phone: string;
  password: string;
  consentTerms: boolean;
  consentMarketing: boolean;
  // After step 2 API call
  userId: string;
  regToken: string;
  // Step 3 – payment
  paid: boolean;
  // Step 4 – email verification
  otp: string;
  // Step 5 – MFA
  mfaQr: string;
  mfaSecret: string;
  mfaCode: string;
  mfaEnabled: boolean;
  // Step 6 – workspace
  orgName: string;
}

const INITIAL: RegState = {
  plan: "starter",
  name: "", email: "", phone: "", password: "",
  consentTerms: false, consentMarketing: false,
  userId: "", regToken: "",
  paid: false,
  otp: "",
  mfaQr: "", mfaSecret: "", mfaCode: "", mfaEnabled: false,
  orgName: "",
};

const PLANS = [
  {
    id: "starter" as Plan,
    name: "Starter",
    price: "Free",
    sub: "forever",
    features: ["1 ISO standard", "Up to 10 users", "Gap analysis", "Evidence vault"],
    color: "border-slate-200 bg-white",
    active: "border-blue-500 ring-2 ring-blue-100 bg-blue-50/50",
    badge: null,
  },
  {
    id: "professional" as Plan,
    name: "Professional",
    price: "A$249",
    sub: "/month",
    features: ["All 5 ISO standards", "Up to 50 users", "Audit report generator", "Team collaboration"],
    color: "border-slate-200 bg-white",
    active: "border-blue-500 ring-2 ring-blue-100 bg-blue-50/50",
    badge: "Most Popular",
  },
  {
    id: "enterprise" as Plan,
    name: "Enterprise",
    price: "Custom",
    sub: "pricing",
    features: ["Unlimited standards", "Unlimited users", "SSO / SAML", "Dedicated support"],
    color: "border-slate-200 bg-white",
    active: "border-blue-500 ring-2 ring-blue-100 bg-blue-50/50",
    badge: null,
  },
];

const STEPS = [
  { id: 1, label: "Plan" },
  { id: 2, label: "Account" },
  { id: 3, label: "Payment" },
  { id: 4, label: "Verify email" },
  { id: 5, label: "Authenticator" },
  { id: 6, label: "Workspace" },
];

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepBar({ step, plan }: { step: number; plan: Plan }) {
  const visibleSteps = plan === "starter"
    ? STEPS.filter((s) => s.id !== 3)
    : STEPS;

  return (
    <div className="flex items-center gap-1 mb-8">
      {visibleSteps.map((s, i) => {
        const actualStep = plan === "starter" && s.id > 2 ? s.id - 1 : s.id;
        const done = step > s.id;
        const active = step === s.id;
        return (
          <div key={s.id} className="flex items-center gap-1">
            {i > 0 && <div className={`h-px flex-1 w-6 ${done ? "bg-blue-500" : "bg-slate-200"}`} />}
            <div className={`size-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
              done ? "bg-blue-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              {done ? <Check className="size-3.5" /> : actualStep}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Left panel ───────────────────────────────────────────────────────────────

function LeftPanel({ step }: { step: number }) {
  const content = [
    { title: "Choose your plan", sub: "Start free, upgrade any time. No credit card required for Starter." },
    { title: "Create your account", sub: "Secure, private, and GDPR compliant. Your data is yours — always." },
    { title: "Activate your subscription", sub: "Unlock the full power of ISOComply with a Professional or Enterprise plan." },
    { title: "Verify your email", sub: "We sent a 6-digit code to your email. This keeps your account secure." },
    { title: "Set up two-factor authentication", sub: "Add an extra layer of security with an authenticator app. Recommended for all accounts." },
    { title: "Create your workspace", sub: "Give your organisation a home in ISOComply. You can invite team members right after." },
  ];
  const c = content[step - 1] ?? content[0];

  return (
    <div
      className="hidden lg:flex lg:w-[45%] xl:w-[48%] flex-col justify-between p-12 relative overflow-hidden"
      style={{ backgroundColor: "#0a0f1e" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(139,92,246,0.10) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(99,102,241,0.8) 39px, rgba(99,102,241,0.8) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(99,102,241,0.8) 39px, rgba(99,102,241,0.8) 40px)",
        }}
      />

      <LogoLink />

      <div className="relative flex-1 flex flex-col justify-center py-10 gap-8">
        <div>
          <h2
            className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            {c.title}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">{c.sub}</p>
        </div>

        <ul className="space-y-3">
          {[
            "Free Starter plan — no credit card required",
            "All 5 ISO standards covered",
            "Audit-ready in weeks, not months",
            "Invite your whole team",
            "Cancel or upgrade any time",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
              <CheckCircle2 className="size-4 text-blue-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "500+", label: "Organisations" },
            { value: "4 mo", label: "Avg. audit-ready" },
            { value: "98%", label: "Audit pass rate" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
              <p className="text-xl font-bold text-white mb-0.5" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
                {s.value}
              </p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border border-white/10 rounded-2xl p-5 bg-white/[0.03]">
        <div className="flex gap-0.5 mb-3">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className="size-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          &ldquo;ISOComply cut our ISO 27001 preparation time by 60%. We were audit-ready in under 3 months.&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">SR</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Sarah Roberts</p>
            <p className="text-[10px] text-slate-500">Head of Compliance, Nexlayer</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main registration component (uses useSearchParams) ───────────────────────

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [state, setState] = useState<RegState>(() => {
    const plan = (searchParams.get("plan") as Plan) ?? "starter";
    return { ...INITIAL, plan };
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpResent, setOtpResent] = useState(false);

  const set = (patch: Partial<RegState>) => setState((s) => ({ ...s, ...patch }));

  // Handle Stripe return (step param in URL)
  useEffect(() => {
    const urlStep = searchParams.get("step");
    const urlUserId = searchParams.get("userId");
    const urlRegToken = searchParams.get("regToken");
    const urlPaid = searchParams.get("paid");
    if (urlStep === "verify" && urlUserId && urlRegToken) {
      set({ userId: urlUserId, regToken: urlRegToken, paid: urlPaid === "1" });
      setStep(4);
    }
  }, []);

  // ── Step 1: Plan selection ──────────────────────────────────────────────────

  function Step1() {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          Choose your plan
        </h1>
        <p className="text-sm text-slate-500 mb-6">You can switch plans at any time from your dashboard.</p>

        <div className="space-y-3 mb-6">
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => set({ plan: p.id })}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                state.plan === p.id ? p.active : p.color + " hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{p.name}</span>
                  {p.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-900">{p.price}</span>
                  <span className="text-xs text-slate-400">{p.sub}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                {p.features.map((f) => (
                  <span key={f} className="text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-blue-400 shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setStep(2)}
          className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          Continue with {PLANS.find((p) => p.id === state.plan)?.name}
          <ArrowRight className="size-4" />
        </button>
      </div>
    );
  }

  // ── Step 2: Account details ─────────────────────────────────────────────────

  async function submitAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isPasswordStrong(state.password)) {
      setError("Password does not meet the complexity requirements below.");
      return;
    }
    if (!state.consentTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    if (!captchaToken) {
      setError("Please complete the human verification.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          email: state.email,
          password: state.password,
          phone: state.phone,
          consentTerms: state.consentTerms,
          consentMarketing: state.consentMarketing,
          captchaToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }
      set({ userId: data.userId, regToken: data.regToken });
      setStep(state.plan === "starter" ? 4 : 3); // skip payment for starter
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function Step2() {
    const checks = getPasswordChecks(state.password);
    return (
      <form onSubmit={submitAccount}>
        <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          Create your account
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Setting up your{" "}
          <button type="button" onClick={() => setStep(1)} className="text-blue-600 hover:underline font-medium">
            {PLANS.find((p) => p.id === state.plan)?.name} plan
          </button>
        </p>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors shadow-sm mb-5"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400 font-medium">or sign up with email</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full name</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <Input id="name" value={state.name} onChange={(e) => set({ name: e.target.value })}
                placeholder="Your full name" className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                required autoComplete="name" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <Input id="email" type="email" value={state.email} onChange={(e) => set({ email: e.target.value })}
                placeholder="you@company.com" className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                required autoComplete="email" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Mobile number <span className="text-slate-400 font-normal">(for account recovery)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <Input id="phone" type="tel" value={state.phone} onChange={(e) => set({ phone: e.target.value })}
                placeholder="+61 400 000 000" className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                autoComplete="tel" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <Input id="password" type={showPassword ? "text" : "password"} value={state.password}
                onChange={(e) => set({ password: e.target.value })}
                placeholder="Min. 12 characters"
                className="pl-10 pr-10 h-11 rounded-xl border-slate-200 text-sm"
                required autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {state.password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {checks.map((c) => (
                  <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.pass ? "text-emerald-600" : "text-slate-400"}`}>
                    <span className={`size-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${c.pass ? "bg-emerald-100" : "bg-slate-100"}`}>
                      {c.pass ? "✓" : "·"}
                    </span>
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* GDPR — required */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={state.consentTerms}
              onChange={(e) => set({ consentTerms: e.target.checked })}
              className="mt-0.5 size-4 rounded border-slate-300 accent-blue-600 shrink-0" required />
            <span className="text-xs text-slate-500 leading-relaxed">
              I have read and agree to the{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>,
              and I consent to ISOComply processing my personal data to provide this service.{" "}
              <span className="text-slate-400">(Required)</span>
            </span>
          </label>

          {/* Marketing — optional */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={state.consentMarketing}
              onChange={(e) => set({ consentMarketing: e.target.checked })}
              className="mt-0.5 size-4 rounded border-slate-300 accent-blue-600 shrink-0" />
            <span className="text-xs text-slate-500 leading-relaxed">
              I&apos;d like to receive compliance tips, product updates, and relevant news by email.{" "}
              <span className="text-slate-400">(Optional)</span>
            </span>
          </label>

          {/* Captcha */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">Human verification</Label>
            <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken("")} />
          </div>

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </span>
            ) : (
              <>Continue <ArrowRight className="size-4" /></>
            )}
          </button>
        </div>
      </form>
    );
  }

  // ── Step 3: Payment ─────────────────────────────────────────────────────────

  async function handlePayment() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: state.plan,
          email: state.email,
          userId: state.userId,
          regToken: state.regToken,
        }),
      });
      const data = await res.json();
      if (data.devMode) {
        // Stripe not configured — skip in dev
        set({ paid: true });
        setStep(4);
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.error ?? "Payment setup failed. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function Step3() {
    const selectedPlan = PLANS.find((p) => p.id === state.plan)!;
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          Activate your subscription
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          You selected the{" "}
          <button onClick={() => setStep(1)} className="text-blue-600 hover:underline font-medium">
            {selectedPlan.name} plan
          </button>. You can switch plans at any time.
        </p>

        <div className="rounded-2xl border-2 border-blue-500 bg-blue-50/50 p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-slate-900">{selectedPlan.name} Plan</p>
              <p className="text-xs text-slate-500">{selectedPlan.features.slice(0, 2).join(" · ")}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900 text-lg">{selectedPlan.price}</p>
              <p className="text-xs text-slate-400">{selectedPlan.sub}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {selectedPlan.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="size-4 text-blue-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600 mb-4">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mb-3"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Redirecting to payment…
            </span>
          ) : (
            <>
              <CreditCard className="size-4" />
              Pay with card
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <button
          onClick={() => setStep(1)}
          className="w-full h-10 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors"
        >
          Switch to a different plan
        </button>
      </div>
    );
  }

  // ── Step 4: Email verification ──────────────────────────────────────────────

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (state.otp.length !== 6) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: state.userId,
          email: state.email,
          otp: state.otp,
          regToken: state.regToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed. Please check your code and try again.");
        return;
      }
      setStep(5);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setOtpResent(false);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name, email: state.email, password: state.password,
          phone: state.phone, consentTerms: true,
          consentMarketing: state.consentMarketing,
          _resend: true,
        }),
      });
      if (res.ok) setOtpResent(true);
    } catch {}
  }

  function Step4() {
    return (
      <form onSubmit={submitOtp}>
        <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          Verify your email
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          We sent a 6-digit code to <span className="font-medium text-slate-700">{state.email}</span>.
          Check your inbox (and spam folder).
        </p>

        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}
          {otpResent && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-600">
              <CheckCircle2 className="size-4 shrink-0" />
              A new code has been sent to your email.
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="otp" className="text-sm font-medium text-slate-700">Verification code</Label>
            <Input
              id="otp"
              value={state.otp}
              onChange={(e) => set({ otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              placeholder="000000"
              maxLength={6}
              className="h-14 rounded-xl border-slate-200 text-2xl font-mono tracking-[0.5em] text-center"
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </div>

          <button
            type="submit"
            disabled={loading || state.otp.length !== 6}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying…
              </span>
            ) : (
              <>Verify email <ArrowRight className="size-4" /></>
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            Didn&apos;t receive it?{" "}
            <button type="button" onClick={resendOtp} className="text-blue-600 hover:underline">
              Resend code
            </button>
          </p>
        </div>
      </form>
    );
  }

  // ── Step 5: MFA setup ───────────────────────────────────────────────────────

  const mfaFetched = useRef(false);

  useEffect(() => {
    if (step === 5 && !mfaFetched.current && state.userId && state.regToken) {
      mfaFetched.current = true;
      fetch(`/api/onboarding/mfa-init?userId=${state.userId}&regToken=${state.regToken}&email=${encodeURIComponent(state.email)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.qrDataUrl) set({ mfaQr: d.qrDataUrl, mfaSecret: d.secret });
        });
    }
  }, [step]);

  async function submitMfa(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/mfa-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: state.userId,
          email: state.email,
          regToken: state.regToken,
          code: state.mfaCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid code. Please try again.");
        return;
      }
      set({ mfaEnabled: true });
      setStep(6);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function Step5() {
    return (
      <form onSubmit={submitMfa}>
        <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          Set up two-factor authentication
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, or similar), then enter the 6-digit code below.
        </p>

        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          {/* QR code */}
          <div className="flex flex-col items-center gap-3 py-4">
            {state.mfaQr ? (
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={state.mfaQr} alt="MFA QR code" className="size-40" />
              </div>
            ) : (
              <div className="size-40 rounded-xl bg-slate-100 flex items-center justify-center">
                <span className="size-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
            {state.mfaSecret && (
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Can&apos;t scan? Enter this code manually:</p>
                <code className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg text-slate-700 tracking-wider">
                  {state.mfaSecret}
                </code>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mfaCode" className="text-sm font-medium text-slate-700">Authenticator code</Label>
            <Input
              id="mfaCode"
              value={state.mfaCode}
              onChange={(e) => set({ mfaCode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              placeholder="000000"
              maxLength={6}
              className="h-14 rounded-xl border-slate-200 text-2xl font-mono tracking-[0.5em] text-center"
              inputMode="numeric"
            />
          </div>

          <button
            type="submit"
            disabled={loading || state.mfaCode.length !== 6}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying…
              </span>
            ) : (
              <>Enable authenticator <ArrowRight className="size-4" /></>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(6)}
            className="w-full h-10 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors"
          >
            Skip for now — set up later in security settings
          </button>
        </div>
      </form>
    );
  }

  // ── Step 6: Workspace ───────────────────────────────────────────────────────

  async function submitWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!state.orgName.trim()) {
      setError("Please enter your organisation name.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: state.userId,
          regToken: state.regToken,
          orgName: state.orgName.trim(),
          plan: state.plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create workspace. Please try again.");
        return;
      }
      // Auto sign-in and redirect to dashboard
      const result = await signIn("credentials", {
        email: state.email,
        password: state.password,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/dashboard");
      } else {
        // Sign-in after registration — redirect to login
        router.push(`/login?registered=1&email=${encodeURIComponent(state.email)}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function Step6() {
    return (
      <form onSubmit={submitWorkspace}>
        <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
          Create your workspace
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          This is your organisation&apos;s home in ISOComply. You can invite team members right after setup.
        </p>

        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="orgName" className="text-sm font-medium text-slate-700">Organisation name</Label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <Input
                id="orgName"
                value={state.orgName}
                onChange={(e) => set({ orgName: e.target.value })}
                placeholder="Your company name"
                className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-400">
              This will be visible to your team members.
            </p>
          </div>

          {/* Summary card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Account summary</p>
            {[
              { icon: User, label: "Name", value: state.name },
              { icon: Mail, label: "Email", value: state.email },
              { icon: ShieldCheck, label: "Plan", value: PLANS.find((p) => p.id === state.plan)?.name ?? state.plan },
              { icon: Smartphone, label: "2FA", value: state.mfaEnabled ? "Enabled" : "Not set up yet" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm">
                <Icon className="size-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-12 shrink-0">{label}</span>
                <span className="text-slate-700 font-medium">{value}</span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !state.orgName.trim()}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up workspace…
              </span>
            ) : (
              <>
                Create workspace &amp; go to dashboard
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </form>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const displayStep = state.plan === "starter" && step > 2 ? step - 1 : step;
  const maxStep = state.plan === "starter" ? 5 : 6;

  return (
    <div className="min-h-screen flex">
      <LeftPanel step={step} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <LogoLink dark />
        </div>

        <div className="w-full max-w-md">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">
                Step {displayStep} of {maxStep}
              </span>
              {step > 1 && (
                <button
                  onClick={() => { setError(null); setStep((s) => s - 1); }}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  ← Back
                </button>
              )}
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${(displayStep / maxStep) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
          {step === 5 && <Step5 />}
          {step === 6 && <Step6 />}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in
            </Link>
          </p>

          <div className="mt-4 flex items-center justify-center gap-4">
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

// ─── Page export (Suspense wrapper for useSearchParams) ────────────────────────

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
