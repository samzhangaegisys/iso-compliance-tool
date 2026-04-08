// Single source of truth for plan definitions — used by pricing section and registration.

export type PlanId = "starter" | "professional" | "enterprise";

export interface PlanDef {
  id: PlanId;
  name: string;
  monthlyPerUser: number;
  annualPerUser: number;
  minUsers: number;
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
    description: "For small teams starting their compliance journey",
    features: [
      "1 ISO standard (chosen at sign-up)",
      "5–10 users",
      "AI-guided gap analysis",
      "Evidence vault",
      "PDF audit reports",
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
    badge: "Most Popular",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPerUser: 79,
    annualPerUser: 63,
    minUsers: 5,
    description: "For large organisations and consulting firms",
    features: [
      "Everything in Professional",
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
