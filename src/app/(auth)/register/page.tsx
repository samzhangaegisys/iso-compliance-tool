"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import {
  ShieldCheck, Mail, Lock, User, Phone, AlertCircle, ArrowRight,
  CheckCircle2, Building2, Smartphone, CreditCard, Eye, EyeOff, Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoLink } from "@/components/landing/logo-link";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { getPasswordChecks, isPasswordStrong } from "@/lib/password-checks";
import { PLANS, type PlanId } from "@/lib/plans";

// ─── Country codes ────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia", pattern: /^04\d{8}$/, hint: "04XX XXX XXX" },
  { code: "+1",  country: "US", flag: "🇺🇸", name: "United States", pattern: /^\d{10}$/, hint: "XXX XXX XXXX" },
  { code: "+1",  country: "CA", flag: "🇨🇦", name: "Canada", pattern: /^\d{10}$/, hint: "XXX XXX XXXX" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom", pattern: /^07\d{9}$/, hint: "07XXX XXXXXX" },
  { code: "+64", country: "NZ", flag: "🇳🇿", name: "New Zealand", pattern: /^02\d{7,9}$/, hint: "02X XXX XXXX" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore", pattern: /^[89]\d{7}$/, hint: "8XXX XXXX" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia", pattern: /^01\d{8,9}$/, hint: "01X XXXX XXXX" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India", pattern: /^[6-9]\d{9}$/, hint: "XXXXX XXXXX" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China", pattern: /^1[3-9]\d{9}$/, hint: "1XX XXXX XXXX" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan", pattern: /^0\d{9,10}$/, hint: "0X XXXX XXXX" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea", pattern: /^01\d{8,9}$/, hint: "01X XXXX XXXX" },
  { code: "+852", country: "HK", flag: "🇭🇰", name: "Hong Kong", pattern: /^[569]\d{7}$/, hint: "XXXX XXXX" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany", pattern: /^\d{10,11}$/, hint: "0XXX XXXXXXX" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France", pattern: /^0[67]\d{8}$/, hint: "06 XX XX XX XX" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE", pattern: /^05\d{8}$/, hint: "05X XXX XXXX" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa", pattern: /^0[67]\d{8}$/, hint: "06X XXX XXXX" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil", pattern: /^\d{10,11}$/, hint: "XX XXXXX XXXX" },
  { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines", pattern: /^09\d{9}$/, hint: "09XX XXX XXXX" },
  { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand", pattern: /^0[689]\d{8}$/, hint: "0X XXXX XXXX" },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia", pattern: /^08\d{8,11}$/, hint: "08XX XXXX XXXX" },
];

function validatePhone(dialCode: string, number: string): boolean {
  const digits = number.replace(/\D/g, "");
  if (!digits) return false; // required field
  const entry = COUNTRY_CODES.find((c) => c.code === dialCode && (c.country === "US" ? dialCode === "+1" : true));
  if (!entry) return digits.length >= 7 && digits.length <= 15;
  return entry.pattern.test(digits);
}

// ─── State ────────────────────────────────────────────────────────────────────

interface RegState {
  plan: PlanId;
  name: string; email: string; phone: string; dialCode: string; password: string;
  consentTerms: boolean; consentMarketing: boolean;
  userId: string; regToken: string;
  paid: boolean;
  otp: string; devOtp: string;
  mfaQr: string; mfaSecret: string; mfaCode: string; mfaEnabled: boolean;
  orgName: string;
}

const INITIAL: RegState = {
  plan: "starter",
  name: "", email: "", phone: "", dialCode: "+61", password: "",
  consentTerms: false, consentMarketing: false,
  userId: "", regToken: "",
  paid: false, otp: "", devOtp: "",
  mfaQr: "", mfaSecret: "", mfaCode: "", mfaEnabled: false,
  orgName: "",
};

// ─── Left panel ───────────────────────────────────────────────────────────────

const LEFT_COPY = [
  { title: "Choose your plan",           sub: "Start with per-user pricing. Minimum 5 users. Switch plans any time." },
  { title: "Create your account",        sub: "Secure, private, and GDPR compliant. Your data is always yours." },
  { title: "Verify your email",          sub: "We sent a 6-digit code to your inbox. This keeps your account secure." },
  { title: "Activate your subscription", sub: "Unlock the full power of ISOComply with a paid plan." },
  { title: "Set up authenticator",       sub: "Add an extra layer of security. Strongly recommended for compliance professionals." },
  { title: "Create your workspace",      sub: "Give your organisation a home in ISOComply. Invite your team right after setup." },
];

function LeftPanel({ step }: { step: number }) {
  const c = LEFT_COPY[step - 1] ?? LEFT_COPY[0];
  return (
    <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] flex-col justify-between p-12 relative overflow-hidden"
      style={{ backgroundColor: "#0a0f1e" }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(139,92,246,0.10) 0%, transparent 60%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(99,102,241,0.8) 39px, rgba(99,102,241,0.8) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(99,102,241,0.8) 39px, rgba(99,102,241,0.8) 40px)" }} />
      <LogoLink />
      <div className="relative flex-1 flex flex-col justify-center py-10 gap-8">
        <div>
          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>{c.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">{c.sub}</p>
        </div>
        <ul className="space-y-3">
          {["A$29/user/mo Starter · A$49 Professional · A$79 Enterprise", "All 5 ISO standards covered", "Audit-ready in weeks, not months", "Invite your whole team", "Monthly or annual billing"].map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
              <CheckCircle2 className="size-4 text-blue-400 shrink-0" />{item}
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-3 gap-3">
          {[{ value: "500+", label: "Organisations" }, { value: "4 mo", label: "Avg. audit-ready" }, { value: "98%", label: "Audit pass rate" }].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
              <p className="text-xl font-bold text-white mb-0.5" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>{s.value}</p>
              <p className="text-[10px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Register form ─────────────────────────────────────────────────────────────

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [state, setState] = useState<RegState>(() => ({
    ...INITIAL,
    plan: (searchParams.get("plan") as PlanId) ?? "starter",
  }));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpResent, setOtpResent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const set = (patch: Partial<RegState>) => setState((s) => ({ ...s, ...patch }));

  // Resume after Stripe redirect. The user is already signed in (we did that right
  // after verify-email), so the NextAuth session cookie survives the Stripe round-trip
  // and the MFA / workspace endpoints can identify the user via auth() on the server.
  // We rehydrate the displayed name/email from the NextAuth session so the workspace
  // summary card shows the user's details even though React state was wiped by the
  // page reload.
  useEffect(() => {
    const urlStep = searchParams.get("step");
    if (urlStep === "mfa") {
      set({ paid: true });
      setStep(5);
      fetch("/api/auth/session")
        .then((r) => r.json())
        .then((s) => {
          if (s?.user?.email) {
            set({ email: s.user.email, name: s.user.name ?? "" });
          }
        })
        .catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resend OTP cooldown — ticks down each second while > 0. We START the cooldown
  // explicitly: after register succeeds (initial OTP sent) and after each successful
  // resend. Don't auto-reset on step entry, or it'd loop forever once it hit 0.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // MFA QR fetch when entering step 5. The endpoint reads the user from the NextAuth
  // session cookie set during verify-email, so no per-request token is needed.
  const mfaFetched = useRef(false);
  useEffect(() => {
    if (step !== 5 || mfaFetched.current) return;
    mfaFetched.current = true;
    (async () => {
      try {
        const r = await fetch("/api/onboarding/mfa-init");
        const d = await r.json();
        if (r.ok && d.qrDataUrl) {
          set({ mfaQr: d.qrDataUrl, mfaSecret: d.secret });
        } else {
          setError(d.error ?? "Couldn't load authenticator setup. Please refresh.");
          mfaFetched.current = false;
        }
      } catch {
        setError("Couldn't reach the server while loading authenticator setup. Please refresh.");
        mfaFetched.current = false;
      }
    })();
  }, [step]);

  const activePlan = PLANS.find((p) => p.id === state.plan)!;
  // All plans are paid (Starter $29, Pro $49, Enterprise $79) — every signup goes through Stripe Checkout.
  const displayStep = step;
  const totalSteps = 6;

  function goBack() { setError(null); setStep((s) => s - 1); }

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isPasswordStrong(state.password)) { setError("Password does not meet the complexity requirements."); return; }
    if (!state.consentTerms) { setError("You must agree to the Terms of Service and Privacy Policy."); return; }
    if (!state.phone.trim()) { setError("Mobile number is required."); return; }
    if (!validatePhone(state.dialCode, state.phone)) {
      const entry = COUNTRY_CODES.find((c) => c.code === state.dialCode);
      setPhoneError(`Format: ${entry?.hint ?? "digits only"}`);
      setError("Please enter a valid mobile number.");
      return;
    }
    if (!captchaToken) { setError("Please complete the human verification."); return; }
    setLoading(true);
    try {
      const inviteToken = searchParams.get("invite") ?? undefined;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: state.name, email: state.email, password: state.password, phone: state.phone ? `${state.dialCode}${state.phone.replace(/\D/g, "")}` : undefined, consentTerms: state.consentTerms, consentMarketing: state.consentMarketing, captchaToken, inviteToken }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed. Please try again."); return; }
      set({
        userId: data.userId,
        regToken: data.regToken,
        ...(data.devOtp ? { devOtp: data.devOtp, otp: data.devOtp } : {}),
      });
      setResendCooldown(60);
      setStep(3);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  async function handlePayment() {
    setError(null); setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: state.plan }),
      });
      const data = await res.json();
      if (data.devMode) { set({ paid: true }); setStep(5); return; }
      if (!res.ok || !data.url) { setError(data.error ?? "Payment setup failed."); return; }
      window.location.href = data.url;
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (state.otp.length !== 6) { setError("Please enter the 6-digit code from your email."); return; }
    if (!state.email || !state.userId || !state.regToken) {
      setError("Your registration session has expired. Please refresh and start again.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: state.userId, email: state.email, otp: state.otp, regToken: state.regToken }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Verification failed. Check your code and try again."); return; }
      // Email is verified — establish a NextAuth session so the rest of the flow
      // (Stripe, MFA setup, workspace creation) doesn't need a fragile regToken in
      // the URL. The session cookie survives the Stripe redirect.
      await signOut({ redirect: false });
      const signin = await signIn("credentials", {
        email: state.email,
        password: state.password,
        redirect: false,
      });
      if (signin?.error) {
        setError("Verified but couldn't sign in automatically. Please use the Sign in page.");
        return;
      }
      setStep(4);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleResendOtp() {
    setOtpResent(false); setError(null);
    if (!state.userId || !state.regToken || !state.email) {
      setError("Your registration session has expired. Please refresh and start again.");
      return;
    }
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: state.userId, regToken: state.regToken, email: state.email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Couldn't resend code. Please try again."); return; }
      if (data.devOtp) set({ devOtp: data.devOtp, otp: data.devOtp });
      setOtpResent(true);
      setResendCooldown(60);
    } catch { setError("Something went wrong. Please try again."); }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const res = await fetch("/api/onboarding/mfa-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: state.mfaCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Invalid code. Please try again."); return; }
      set({ mfaEnabled: true }); setStep(6);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleWorkspaceSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!state.orgName.trim()) { setError("Please enter your organisation name."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName: state.orgName.trim(), plan: state.plan }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create workspace. Please try again."); return; }
      // Already signed in (since the verify-email step) — straight to dashboard.
      localStorage.setItem("isocomply_new_user", "1");
      router.push("/dashboard");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  // ── Shared UI pieces ───────────────────────────────────────────────────────

  const errorBanner = error && (
    <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
      <AlertCircle className="size-4 shrink-0" />{error}
    </div>
  );

  const spinner = <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex">
      <LeftPanel step={step} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-white overflow-y-auto">
        <div className="lg:hidden mb-8"><LogoLink dark /></div>

        <div className="w-full max-w-md">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Step {displayStep} of {totalSteps}</span>
              {step > 1 && (
                <button onClick={goBack} className="text-xs text-blue-600 hover:underline">← Back</button>
              )}
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${(displayStep / totalSteps) * 100}%` }} />
            </div>
          </div>

          {/* ── Step 1: Plan selection ─────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
                Choose your plan
              </h1>
              <p className="text-sm text-slate-500 mb-6">All prices in AUD per user/month. Minimum 5 users. Switch any time.</p>

              <div className="space-y-3 mb-6">
                {PLANS.map((p) => {
                  const isActive = state.plan === p.id;
                  return (
                    <button key={p.id} onClick={() => set({ plan: p.id })}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${isActive ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50/50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{p.name}</span>
                          {p.badge && <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">{p.badge}</span>}
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">A${p.monthlyPerUser}</span>
                          <span className="text-xs text-slate-400 ml-1">/user/mo</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2">
                        <Users className="size-3" />Min. {p.minUsers} users · A${p.monthlyPerUser * p.minUsers}/mo minimum
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {p.features.slice(0, 3).map((f) => (
                          <span key={f} className="text-xs text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="size-3 text-blue-400 shrink-0" />{f}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setStep(2)}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                Continue with {activePlan.name} — A${activePlan.monthlyPerUser}/user/mo
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}

          {/* ── Step 2: Account details ────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleAccountSubmit} noValidate>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>Create your account</h1>
              <p className="text-sm text-slate-500 mb-6">
                Setting up{" "}
                <button type="button" onClick={() => setStep(1)} className="text-blue-600 hover:underline font-medium">
                  {activePlan.name} — A${activePlan.monthlyPerUser}/user/mo
                </button>
              </p>

              {/* Google */}
              <button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors shadow-sm mb-5">
                <svg className="size-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">or sign up with email</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <div className="space-y-4">
                {errorBanner}

                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-sm font-medium text-slate-700">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <Input id="reg-name" value={state.name} onChange={(e) => set({ name: e.target.value })}
                      placeholder="Your full name" className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                      required autoComplete="name" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-sm font-medium text-slate-700">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <Input id="reg-email" type="email" value={state.email} onChange={(e) => set({ email: e.target.value })}
                      placeholder="you@company.com" className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                      required autoComplete="email" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Mobile number
                  </Label>
                  <div className="flex gap-2">
                    {/* Country code selector */}
                    <select
                      value={state.dialCode}
                      onChange={(e) => { set({ dialCode: e.target.value, phone: "" }); setPhoneError(null); }}
                      className="h-11 rounded-xl border border-slate-200 text-sm px-2 bg-white text-slate-700 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      style={{ width: "100px" }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={`${c.code}-${c.country}`} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    {/* Number input */}
                    <div className="relative flex-1">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                      <Input
                        id="reg-phone"
                        type="tel"
                        value={state.phone}
                        onChange={(e) => {
                          set({ phone: e.target.value });
                          setPhoneError(null);
                        }}
                        onBlur={() => {
                          if (state.phone && !validatePhone(state.dialCode, state.phone)) {
                            const entry = COUNTRY_CODES.find((c) => c.code === state.dialCode);
                            setPhoneError(`Format: ${entry?.hint ?? "digits only"}`);
                          }
                        }}
                        placeholder={COUNTRY_CODES.find((c) => c.code === state.dialCode)?.hint ?? "Number"}
                        className={`pl-10 h-11 rounded-xl text-sm ${phoneError ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200"}`}
                        autoComplete="tel-national"
                      />
                    </div>
                  </div>
                  {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className="text-sm font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <Input id="reg-password" type={showPassword ? "text" : "password"} value={state.password}
                      onChange={(e) => set({ password: e.target.value })}
                      placeholder="Min. 12 characters" className="pl-10 pr-10 h-11 rounded-xl border-slate-200 text-sm"
                      required autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {state.password.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {getPasswordChecks(state.password).map((c) => (
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

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={state.consentTerms} onChange={(e) => set({ consentTerms: e.target.checked })}
                    className="mt-0.5 size-4 rounded border-slate-300 accent-blue-600 shrink-0" required />
                  <span className="text-xs text-slate-500 leading-relaxed">
                    I agree to the <Link href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link> and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>, and consent to ISOComply processing my personal data.{" "}
                    <span className="text-slate-400">(Required)</span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={state.consentMarketing} onChange={(e) => set({ consentMarketing: e.target.checked })}
                    className="mt-0.5 size-4 rounded border-slate-300 accent-blue-600 shrink-0" />
                  <span className="text-xs text-slate-500 leading-relaxed">
                    I&apos;d like to receive compliance tips and product updates by email. <span className="text-slate-400">(Optional)</span>
                  </span>
                </label>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Human verification</Label>
                  <TurnstileWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken("")} />
                </div>

                <button type="submit" disabled={loading || !captchaToken}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {loading ? <>{spinner} Creating account…</> : <>Continue <ArrowRight className="size-4" /></>}
                </button>
              </div>
            </form>
          )}

          {/* ── Step 4: Payment ───────────────────────────────────────── */}
          {step === 4 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>Activate your subscription</h1>
              <p className="text-sm text-slate-500 mb-6">
                <button onClick={() => setStep(1)} className="text-blue-600 hover:underline font-medium">{activePlan.name}</button>
                {" "}— A${activePlan.monthlyPerUser}/user/mo · min. {activePlan.minUsers} users
              </p>

              <div className="rounded-2xl border-2 border-blue-500 bg-blue-50/50 p-5 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{activePlan.name} Plan</p>
                    <p className="text-xs text-slate-500">{activePlan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-lg">A${activePlan.monthlyPerUser}</p>
                    <p className="text-xs text-slate-400">/user/mo</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {activePlan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="size-4 text-blue-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>

              {errorBanner && <div className="mb-4">{errorBanner}</div>}

              <button onClick={handlePayment} disabled={loading}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60 mb-3">
                {loading ? <>{spinner} Redirecting to payment…</> : <><CreditCard className="size-4" />Pay with card <ArrowRight className="size-4" /></>}
              </button>
              <button onClick={() => setStep(1)}
                className="w-full h-10 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors">
                Switch to a different plan
              </button>
            </div>
          )}

          {/* ── Step 3: Email verification ─────────────────────────────── */}
          {step === 3 && (
            <form onSubmit={handleOtpSubmit}>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>Verify your email</h1>
              <p className="text-sm text-slate-500 mb-6">
                We sent a 6-digit code to <span className="font-medium text-slate-700">{state.email}</span>.
                Check your inbox and spam folder.
              </p>

              <div className="space-y-4">
                {errorBanner}
                {otpResent && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-600">
                    <CheckCircle2 className="size-4 shrink-0" />A new code has been sent.
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="reg-otp" className="text-sm font-medium text-slate-700">Verification code</Label>
                  <Input id="reg-otp" value={state.otp}
                    onChange={(e) => set({ otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="000000" maxLength={6}
                    className="h-14 rounded-xl border-slate-200 text-2xl font-mono tracking-[0.5em] text-center"
                    autoComplete="one-time-code" inputMode="numeric" autoFocus />
                </div>

                <button type="submit" disabled={loading || state.otp.length !== 6}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {loading ? <>{spinner} Verifying…</> : <>Verify email <ArrowRight className="size-4" /></>}
                </button>

                <p className="text-center text-xs text-slate-400">
                  Didn&apos;t receive it?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="text-blue-600 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
                  </button>
                </p>

                {state.devOtp && (
                  <p className="text-center text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Non-production environment: code auto-filled (<span className="font-mono font-semibold">{state.devOtp}</span>). Email delivery is sandboxed until a Resend domain is verified.
                  </p>
                )}
              </div>
            </form>
          )}

          {/* ── Step 5: MFA setup ─────────────────────────────────────── */}
          {step === 5 && (
            <form onSubmit={handleMfaSubmit}>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>Set up two-factor authentication</h1>
              <p className="text-sm text-slate-500 mb-6">
                Scan this QR code with Google Authenticator, Authy, or 1Password, then enter the 6-digit code.
              </p>

              <div className="space-y-4">
                {errorBanner}

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
                      <code className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg text-slate-700 tracking-wider">{state.mfaSecret}</code>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-mfa" className="text-sm font-medium text-slate-700">Authenticator code</Label>
                  <Input id="reg-mfa" value={state.mfaCode}
                    onChange={(e) => set({ mfaCode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="000000" maxLength={6}
                    className="h-14 rounded-xl border-slate-200 text-2xl font-mono tracking-[0.5em] text-center"
                    inputMode="numeric" />
                </div>

                <button type="submit" disabled={loading || state.mfaCode.length !== 6}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {loading ? <>{spinner} Verifying…</> : <>Enable authenticator <ArrowRight className="size-4" /></>}
                </button>

                <button type="button" onClick={() => setStep(6)}
                  className="w-full h-10 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50 transition-colors">
                  Skip for now — set up later in security settings
                </button>
              </div>
            </form>
          )}

          {/* ── Step 6: Workspace ─────────────────────────────────────── */}
          {step === 6 && (
            <form onSubmit={handleWorkspaceSubmit}>
              <h1 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>Create your workspace</h1>
              <p className="text-sm text-slate-500 mb-6">Your organisation&apos;s home in ISOComply. Invite team members right after setup.</p>

              <div className="space-y-4">
                {errorBanner}

                <div className="space-y-1.5">
                  <Label htmlFor="reg-org" className="text-sm font-medium text-slate-700">Organisation name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <Input id="reg-org" value={state.orgName} onChange={(e) => set({ orgName: e.target.value })}
                      placeholder="Your company name" className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                      required autoFocus />
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Account summary</p>
                  {[
                    { icon: User,       label: "Name",  value: state.name },
                    { icon: Mail,       label: "Email", value: state.email },
                    { icon: ShieldCheck,label: "Plan",  value: `${activePlan.name} — A$${activePlan.monthlyPerUser}/user/mo` },
                    { icon: Smartphone, label: "2FA",   value: state.mfaEnabled ? "Enabled" : "Not set up yet" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2.5 text-sm">
                      <Icon className="size-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500 w-12 shrink-0">{label}</span>
                      <span className="text-slate-700 font-medium truncate">{value}</span>
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={loading || !state.orgName.trim()}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {loading ? <>{spinner} Setting up workspace…</> : <>Create workspace &amp; go to dashboard <ArrowRight className="size-4" /></>}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</Link>
          </p>

          <div className="mt-4 flex items-center justify-center gap-4">
            {["SOC 2 Type II", "GDPR Ready", "256-bit Encryption"].map((t) => (
              <div key={t} className="flex items-center gap-1 text-[10px] text-slate-400">
                <ShieldCheck className="size-3 text-slate-300" />{t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
