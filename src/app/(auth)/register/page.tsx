"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoLink } from "@/components/landing/logo-link";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { getPasswordChecks, isPasswordStrong } from "@/lib/password";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    orgName: "",
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isPasswordStrong(formData.password)) {
      setError("Password does not meet the complexity requirements below.");
      return;
    }
    if (!consentTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    if (!captchaToken) {
      setError("Please complete the human verification below.");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        captchaToken,
        redirect: false,
      });
      if (result?.error) {
        setError("Registration failed. Please try again.");
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
        className="hidden lg:flex lg:w-[45%] xl:w-[48%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "#0a0f1e" }}
      >
        {/* Background */}
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

        {/* Centre content */}
        <div className="relative flex-1 flex flex-col justify-center py-10 gap-8">
          <div>
            <h2
              className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Start your
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                free trial today
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Join 500+ organisations already preparing for ISO certification with ISOComply. No credit card required.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              "Free plan — no credit card required",
              "All 5 ISO standards included",
              "Gap analysis ready in minutes",
              "Invite your whole team for free",
              "Cancel or upgrade any time",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-400">
                <CheckCircle2 className="size-4 text-blue-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "500+", label: "Organisations" },
              { value: "4 mo", label: "Avg. time to cert." },
              { value: "98%", label: "Audit pass rate" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                <p
                  className="text-xl font-bold text-white mb-0.5"
                  style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                >
                  {s.value}
                </p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative border border-white/10 rounded-2xl p-5 bg-white/[0.03]">
          <div className="flex gap-0.5 mb-3">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className="size-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            &ldquo;Setup took under an hour. We had our first gap analysis report the same afternoon. Incredible product.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">JC</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">James Chen</p>
              <p className="text-[10px] text-slate-500">Quality Manager, BlueSky Tech</p>
            </div>
          </div>
        </div>
      </div>

      {/* -- Right panel: form -- */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <LogoLink dark />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1
              className="text-2xl font-bold text-slate-900 mb-1"
              style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              Create your free account
            </h1>
            <p className="text-sm text-slate-500">
              Set up your organisation and start tracking compliance
            </p>
          </div>

          {/* Google sign-in */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 h-11 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors disabled:opacity-50 mb-5 shadow-sm"
          >
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Input id="name" name="name" value={formData.name} onChange={handleChange}
                  placeholder="Jane Smith" className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                  required autoComplete="name" />
              </div>
            </div>

            {/* Organisation */}
            <div className="space-y-1.5">
              <Label htmlFor="orgName" className="text-sm font-medium text-slate-700">Organisation name</Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input id="orgName" name="orgName" value={formData.orgName} onChange={handleChange}
                  placeholder="Acme Ltd" className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                  required />
              </div>
            </div>

            {/* Work email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Work email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                  placeholder="jane@company.com" className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                  required autoComplete="email" />
              </div>
            </div>

            {/* Mobile number */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                Mobile number <span className="text-slate-400 font-normal">(required)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange}
                  placeholder="+61 400 000 000" className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                  required autoComplete="tel" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input id="password" name="password" type="password" value={formData.password}
                  onChange={handleChange} placeholder="Min. 12 characters"
                  className="pl-10 h-11 rounded-xl border-slate-200 text-sm"
                  required autoComplete="new-password" />
              </div>
              {/* Strength checklist — shown as user types */}
              {formData.password.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {getPasswordChecks(formData.password).map((c) => (
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

            {/* GDPR consent — required */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consentTerms}
                onChange={(e) => setConsentTerms(e.target.checked)}
                className="mt-0.5 size-4 rounded border-slate-300 accent-blue-600 shrink-0"
                required
              />
              <span className="text-xs text-slate-500 leading-relaxed">
                I have read and agree to the{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>,
                and I consent to ISOComply processing my personal data to provide this service. <span className="text-slate-400">(Required)</span>
              </span>
            </label>

            {/* Marketing consent — optional, GDPR-compliant */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consentMarketing}
                onChange={(e) => setConsentMarketing(e.target.checked)}
                className="mt-0.5 size-4 rounded border-slate-300 accent-blue-600 shrink-0"
              />
              <span className="text-xs text-slate-500 leading-relaxed">
                I&apos;d like to receive compliance tips, product updates, and relevant news by email. You can unsubscribe at any time. <span className="text-slate-400">(Optional)</span>
              </span>
            </label>

            {/* Human verification */}
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
                <>
                  Create free account
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
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
