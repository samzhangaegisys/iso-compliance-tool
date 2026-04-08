"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Users, Minus, Plus, Info } from "lucide-react";
import { AnimateIn } from "@/components/landing/scroll-reveal";

const plans = [
  {
    name: "Starter",
    monthlyPerUser: 29,
    annualPerUser: 23,
    minUsers: 5,
    maxUsers: 10,
    description: "For small teams starting their compliance journey",
    features: [
      "1 ISO standard (chosen at sign-up)",
      "5–10 users",
      "AI-guided gap analysis",
      "Evidence vault",
      "PDF audit reports",
      "Email support",
    ],
    cta: "Start 14-day trial",
    href: "/register",
    highlighted: false,
    badge: null,
  },
  {
    name: "Professional",
    monthlyPerUser: 49,
    annualPerUser: 39,
    minUsers: 5,
    maxUsers: 200,
    description: "For growing teams managing multiple ISO standards",
    features: [
      "All 5 ISO standards",
      "Unlimited users (min. 5)",
      "AI Compliance Advisor",
      "Evidence vault with auto-expiry",
      "Branded audit reports",
      "Team task management",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    href: "/register",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    monthlyPerUser: 79,
    annualPerUser: 63,
    minUsers: 5,
    maxUsers: 2000,
    description: "For large organisations and consulting firms",
    features: [
      "Everything in Professional",
      "SSO / SAML",
      "Custom integrations & API",
      "Dedicated account manager",
      "99.9% SLA guarantee",
      "On-premises deployment option",
      "Custom contract & invoicing",
    ],
    cta: "Contact Sales",
    href: "/register",
    highlighted: false,
    badge: null,
  },
];

function UserCounter({ value, onChange, min, max }: { value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
        className="size-6 rounded-full flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 transition-colors">
        <Minus className="size-3" />
      </button>
      <span className="text-sm font-bold text-slate-900 w-6 text-center tabular-nums">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
        className="size-6 rounded-full flex items-center justify-center hover:bg-slate-200 disabled:opacity-30 transition-colors">
        <Plus className="size-3" />
      </button>
    </div>
  );
}

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [userCounts, setUserCounts] = useState<Record<string, number>>({
    Starter: 5,
    Professional: 10,
    Enterprise: 20,
  });

  function setCount(plan: string, n: number) {
    setUserCounts((prev) => ({ ...prev, [plan]: n }));
  }

  function totalPrice(plan: typeof plans[0]) {
    if (!plan.monthlyPerUser) return null;
    const perUser = billing === "annual" ? plan.annualPerUser! : plan.monthlyPerUser;
    const users = userCounts[plan.name] ?? plan.minUsers;
    return perUser * users;
  }

  return (
    <section id="pricing" className="py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
            Simple per-user pricing
          </h2>
          <p className="text-lg text-slate-500 mb-2">
            Pay only for who uses it. Minimum 5 users on all plans.
          </p>
          <p className="text-sm text-slate-400 mb-8">All plans include a 14-day free trial · No credit card required</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-slate-200 rounded-full p-1">
            <button onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Monthly
            </button>
            <button onClick={() => setBilling("annual")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billing === "annual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Annual
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Save 20%</span>
            </button>
          </div>

          {/* Annual billing notice */}
          {billing === "annual" && (
            <div className="mt-4 inline-flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-left max-w-xl">
              <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Annual plans are billed monthly</strong> but require a 12-month commitment.
                If you cancel before 12 months, you remain liable for the remainder of the contract term.
                Plans auto-renew for another 12 months unless cancellation is requested 30 days before renewal.
              </p>
            </div>
          )}
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const price = totalPrice(plan);
            const perUser = billing === "annual" ? plan.annualPerUser : plan.monthlyPerUser;
            const users = userCounts[plan.name] ?? plan.minUsers;

            return (
              <AnimateIn key={plan.name} delay={i * 100} direction="up">
                <div className={`relative rounded-2xl p-8 h-full flex flex-col ${
                  plan.highlighted
                    ? "bg-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/20"
                    : "bg-white border border-slate-200"
                }`}>
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">{plan.badge}</span>
                    </div>
                  )}

                  {/* Plan name & description */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-bold text-lg ${plan.highlighted ? "text-white" : "text-slate-900"}`}
                        style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
                        {plan.name}
                      </p>
                    </div>
                    <p className={`text-sm ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>
                      {plan.description}
                    </p>
                    {/* Min users badge */}
                    <div className={`mt-2 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      plan.highlighted
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}>
                      <Users className="size-3" />
                      Min. {plan.minUsers} users required
                    </div>
                  </div>

                  {/* Price */}
                  {price !== null ? (
                    <div className="mb-5">
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className={`text-4xl font-bold transition-all duration-300 ${plan.highlighted ? "text-white" : "text-slate-900"}`}
                          style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
                          A${price.toLocaleString()}
                        </span>
                        <span className={`text-sm ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>/mo</span>
                      </div>
                      <p className={`text-xs mb-3 ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>
                        A${perUser}/user · {users} user{users !== 1 ? "s" : ""}
                        {billing === "annual" && (
                          <span className="ml-1.5 text-emerald-500 font-medium">· 20% off</span>
                        )}
                      </p>

                      {/* User counter */}
                      <div className="flex items-center gap-2">
                        <Users className="size-3.5 text-slate-400" />
                        <span className={`text-xs ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>Users:</span>
                        <div className={plan.highlighted ? "[&_button]:hover:bg-white/10 [&>div]:bg-white/10 [&_span]:text-white" : ""}>
                          <UserCounter
                            value={users}
                            onChange={(n) => setCount(plan.name, n)}
                            min={plan.minUsers}
                            max={plan.maxUsers}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5">
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-slate-900"}`}
                          style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
                          Custom
                        </span>
                      </div>
                      <p className={`text-xs ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>
                        Volume pricing · Tailored to your organisation
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className={`size-4 shrink-0 ${plan.highlighted ? "text-blue-400" : "text-emerald-500"}`} />
                        <span className={plan.highlighted ? "text-slate-300" : "text-slate-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href={plan.href}
                    className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all hover:scale-[1.02] ${
                      plan.highlighted
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}>
                    {plan.cta}
                  </Link>
                </div>
              </AnimateIn>
            );
          })}
        </div>

        {/* Bottom note */}
        <AnimateIn className="text-center mt-10 space-y-2">
          <p className="text-sm text-slate-400">
            All prices in AUD and exclude GST. All plans require a minimum of 5 users.{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">Volume discounts</Link> available for 50+ users.
          </p>
          <p className="text-xs text-slate-500">
            Annual plans are billed monthly with a 12-month commitment. Cancellation within the contract term does not release payment obligations for the remaining months.
            Plans automatically renew for a further 12 months unless cancelled 30 days before the renewal date.
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
