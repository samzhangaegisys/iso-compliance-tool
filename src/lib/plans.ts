// Single source of truth for plan definitions — used by pricing section and registration.
// Gating logic for these plans lives in src/lib/plan-limits.ts.

export type PlanId = "starter" | "professional" | "enterprise";

export interface PlanDef {
  id: PlanId;
  name: string;
  monthlyPerUser: number;
  annualPerUser: number;
  minUsers: number;
  maxUsers: number | null; // null = unlimited
  description: string;
  features: string[];
  badge: string | null;
  highlighted: boolean;
}

export const PLANS: PlanDef[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPerUser: 29,
    annualPerUser: 23,
    minUsers: 5,
    maxUsers: 5,
    description: "For small teams starting their compliance journey",
    features: [
      "All 5 ISO standards available",
      "Up to 2 active compliance projects",
      "AI-guided gap analysis",
      "Evidence vault with 30-day expiry warnings",
      "Tasks: Kanban, assignment, due dates, comments",
      "Standard PDF audit reports",
      "AI Compliance Advisor — 10 queries/month",
      "5 users (fixed seat plan)",
      "Email support",
    ],
    badge: null,
    highlighted: false,
  },
  {
    id: "professional",
    name: "Professional",
    monthlyPerUser: 49,
    annualPerUser: 39,
    minUsers: 5,
    maxUsers: null,
    description: "For growing teams managing multiple ISO standards",
    features: [
      "Everything in Starter, plus:",
      "Unlimited active compliance projects",
      "Unlimited AI Compliance Advisor queries",
      "Multi-threshold expiry alerts with escalation",
      "Branded / white-label audit reports",
      "Unlimited users (min. 5)",
      "Priority support",
    ],
    badge: "Most Popular",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPerUser: 79,
    annualPerUser: 63,
    minUsers: 5,
    maxUsers: null,
    description: "For large organisations and consulting firms",
    features: [
      "Everything in Professional, plus:",
      "SSO / SAML",
      "Custom integrations & API",
      "Automated onboarding portal",
      "99.9% SLA guarantee",
      "On-premises deployment option",
      "Custom contract & invoicing",
    ],
    badge: null,
    highlighted: false,
  },
];

export function getPlan(id: PlanId): PlanDef {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}
