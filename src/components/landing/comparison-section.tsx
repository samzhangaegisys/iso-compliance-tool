"use client";

import { useInView } from "@/hooks/use-in-view";
import { CountUp, AnimateIn } from "@/components/landing/scroll-reveal";
import { X, Check } from "lucide-react";

const rows = [
  {
    metric: "Time to first certification",
    before: { value: 18, suffix: " months", label: "18 months" },
    after: { value: 4, suffix: " months", label: "4 months" },
  },
  {
    metric: "Audit pass rate (first attempt)",
    before: { value: 67, suffix: "%", label: "67%" },
    after: { value: 98, suffix: "%", label: "98%" },
  },
  {
    metric: "Evidence preparation time",
    before: { value: 120, suffix: " hours", label: "120 hrs" },
    after: { value: 8, suffix: " hours", label: "8 hrs" },
  },
  {
    metric: "Compliance work automated",
    before: { value: 10, suffix: "%", label: "10%" },
    after: { value: 90, suffix: "%", label: "90%" },
  },
  {
    metric: "Team hours saved per week",
    before: { value: 0, suffix: " hrs", label: "0 hrs" },
    after: { value: 32, suffix: " hrs", label: "32 hrs" },
  },
];

function ComparisonRow({
  metric,
  before,
  after,
  delay,
}: {
  metric: string;
  before: { value: number; suffix: string; label: string };
  after: { value: number; suffix: string; label: string };
  delay: number;
}) {
  return (
    <AnimateIn delay={delay} direction="up">
      <div className="grid grid-cols-3 gap-4 items-center py-5 border-b border-slate-200 last:border-0">
        {/* Before */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-9 rounded-full bg-red-50 border border-red-100 mb-2">
            <X className="size-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-slate-400" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
            <CountUp to={before.value} suffix={before.suffix} />
          </p>
        </div>
        {/* Metric label */}
        <div className="text-center px-2">
          <p className="text-sm font-medium text-slate-700">{metric}</p>
        </div>
        {/* After */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center size-9 rounded-full bg-emerald-50 border border-emerald-100 mb-2">
            <Check className="size-4 text-emerald-500" />
          </div>
          <p
            className="text-2xl font-bold text-blue-600"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            <CountUp to={after.value} suffix={after.suffix} />
          </p>
        </div>
      </div>
    </AnimateIn>
  );
}

export function ComparisonSection() {
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      className="py-28 bg-white"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-5"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            The ISOComply difference
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Real results from compliance teams that switched from spreadsheets to ISOComply.
          </p>
        </AnimateIn>

        {/* Table header */}
        <AnimateIn>
          <div className="grid grid-cols-3 gap-4 mb-2 px-4">
            <div className="text-center">
              <span className="inline-block text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 rounded-full px-4 py-1.5">
                Without ISOComply
              </span>
            </div>
            <div />
            <div className="text-center">
              <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 rounded-full px-4 py-1.5">
                With ISOComply
              </span>
            </div>
          </div>
        </AnimateIn>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 px-6 py-2">
          {inView &&
            rows.map((row, i) => (
              <ComparisonRow
                key={row.metric}
                {...row}
                delay={i * 120}
              />
            ))}
          {!inView && rows.map((row) => (
            <div key={row.metric} className="py-5 border-b border-slate-200 last:border-0" style={{ minHeight: "88px" }} />
          ))}
        </div>
      </div>
    </section>
  );
}
