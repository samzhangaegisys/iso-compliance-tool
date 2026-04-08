"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Users, Info } from "lucide-react";
import { AnimateIn } from "@/components/landing/scroll-reveal";
import { PLANS } from "@/lib/plans";

const plans = PLANS.map((p) => ({
  ...p,
  cta: "Get Started",
  href: `/register?plan=${p.id}`,
}));

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <section id="pricing" className="py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Simple per-user pricing
          </h2>
          <p className="text-lg text-slate-500 mb-2">
            Pay only for who uses it. Minimum 5 users on all plans.
          </p>
          <p className="text-sm text-slate-400 mb-8">
            Start with the free Starter plan — no credit card required
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-slate-200 rounded-full p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billing === "monthly"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billing === "annual"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Annual
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Save 20%
              </span>
            </button>
          </div>

          {billing === "annual" && (
            <div className="mt-4 inline-flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-left max-w-xl">
              <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Annual plans are billed monthly</strong> but require a 12-month
                commitment. Plans auto-renew for another 12 months unless cancelled 30
                days before renewal.
              </p>
            </div>
          )}
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const perUser =
              billing === "annual" ? plan.annualPerUser : plan.monthlyPerUser;

            return (
              <AnimateIn key={plan.name} delay={i * 100} direction="up">
                <div
                  className={`relative rounded-2xl p-8 h-full flex flex-col ${
                    plan.highlighted
                      ? "bg-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/20"
                      : "bg-white border border-slate-200"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan name & description */}
                  <div className="mb-5">
                    <p
                      className={`font-bold text-lg mb-1 ${
                        plan.highlighted ? "text-white" : "text-slate-900"
                      }`}
                      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                    >
                      {plan.name}
                    </p>
                    <p
                      className={`text-sm ${
                        plan.highlighted ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>

                  {/* Price — per user only */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span
                        className={`text-4xl font-bold ${
                          plan.highlighted ? "text-white" : "text-slate-900"
                        }`}
                        style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                      >
                        A${perUser}
                      </span>
                      <span
                        className={`text-sm ${
                          plan.highlighted ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        /user/mo
                      </span>
                      {billing === "annual" && (
                        <span className="ml-1 text-xs text-emerald-400 font-semibold">
                          −20%
                        </span>
                      )}
                    </div>
                    <div
                      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        plan.highlighted ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      <Users className="size-3" />
                      Min. {plan.minUsers} users · you choose the count at sign-up
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2
                          className={`size-4 shrink-0 ${
                            plan.highlighted ? "text-blue-400" : "text-emerald-500"
                          }`}
                        />
                        <span
                          className={
                            plan.highlighted ? "text-slate-300" : "text-slate-600"
                          }
                        >
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={plan.href}
                    className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all hover:scale-[1.02] block ${
                      plan.highlighted
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </AnimateIn>
            );
          })}
        </div>

        <AnimateIn className="text-center mt-10 space-y-2">
          <p className="text-sm text-slate-400">
            All prices in AUD and exclude GST. Minimum 5 users on all plans.
            Volume discounts automatically applied for 50+ users at checkout.
          </p>
          <p className="text-xs text-slate-500">
            Annual plans are billed monthly with a 12-month commitment. Cancellation
            within the contract term does not release payment obligations for the
            remaining months.
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}
