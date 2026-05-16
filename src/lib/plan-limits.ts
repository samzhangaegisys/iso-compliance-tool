// Plan limit enforcement — single source of truth for "what does each tier allow?".
// Used by /api/projects, /api/team/invite, and /api/ai/ask to gate features per
// the active subscription on the organisation.

import { prisma } from "./prisma";

export type PlanKey = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export interface PlanLimits {
  maxProjects: number;             // active compliance projects
  maxUsers: number;                // org members including owner
  aiAdvisorPerMonth: number;       // per workspace
  expiryThresholdsMax: number;     // how many alert tiers Pro+ can configure
  brandedReports: boolean;         // logo + colour on PDFs
  whitelabelOnly: boolean;         // strips ISOComply branding entirely (Enterprise)
}

export const PLAN_LIMITS: Record<PlanKey, PlanLimits> = {
  STARTER: {
    maxProjects: 2,
    maxUsers: 5,
    aiAdvisorPerMonth: 10,
    expiryThresholdsMax: 1,
    brandedReports: false,
    whitelabelOnly: false,
  },
  PROFESSIONAL: {
    maxProjects: Number.POSITIVE_INFINITY,
    maxUsers: Number.POSITIVE_INFINITY,
    aiAdvisorPerMonth: Number.POSITIVE_INFINITY,
    expiryThresholdsMax: 5,
    brandedReports: true,
    whitelabelOnly: false,
  },
  ENTERPRISE: {
    maxProjects: Number.POSITIVE_INFINITY,
    maxUsers: Number.POSITIVE_INFINITY,
    aiAdvisorPerMonth: Number.POSITIVE_INFINITY,
    expiryThresholdsMax: 10,
    brandedReports: true,
    whitelabelOnly: true,
  },
};

export async function getOrgPlan(orgId: string): Promise<PlanKey> {
  if (!prisma) return "STARTER";
  const sub = await prisma.subscription.findFirst({
    where: { orgId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  if (!sub) return "STARTER"; // Pre-billing / dev mode → safest default is the tightest tier.
  if (sub.plan === "PROFESSIONAL") return "PROFESSIONAL";
  if (sub.plan === "ENTERPRISE") return "ENTERPRISE";
  return "STARTER"; // FREE/STARTER both resolve to STARTER limits.
}

export async function getLimits(orgId: string): Promise<{ plan: PlanKey; limits: PlanLimits }> {
  const plan = await getOrgPlan(orgId);
  return { plan, limits: PLAN_LIMITS[plan] };
}

// ── Project count ────────────────────────────────────────────────────────────

export async function checkProjectLimit(orgId: string): Promise<{
  allowed: boolean;
  used: number;
  max: number;
  plan: PlanKey;
}> {
  const { plan, limits } = await getLimits(orgId);
  const used = prisma ? await prisma.complianceProject.count({ where: { orgId } }) : 0;
  return { allowed: used < limits.maxProjects, used, max: limits.maxProjects, plan };
}

// ── User / team size ─────────────────────────────────────────────────────────

export async function checkUserLimit(orgId: string): Promise<{
  allowed: boolean;
  used: number;
  max: number;
  plan: PlanKey;
}> {
  const { plan, limits } = await getLimits(orgId);
  const used = prisma ? await prisma.orgMember.count({ where: { orgId } }) : 0;
  return { allowed: used < limits.maxUsers, used, max: limits.maxUsers, plan };
}

// ── AI Compliance Advisor quota ──────────────────────────────────────────────
// Backed by AuditLog entries with action="ai.advisor_query" — no dedicated table.
// `count >= max` means the workspace has used up its quota for the current calendar month.

function startOfThisMonthUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function checkAiAdvisorQuota(orgId: string): Promise<{
  allowed: boolean;
  used: number;
  max: number;
  plan: PlanKey;
}> {
  const { plan, limits } = await getLimits(orgId);
  if (!Number.isFinite(limits.aiAdvisorPerMonth)) {
    return { allowed: true, used: 0, max: limits.aiAdvisorPerMonth, plan };
  }
  const used = prisma
    ? await prisma.auditLog.count({
        where: { orgId, action: "ai.advisor_query", createdAt: { gte: startOfThisMonthUtc() } },
      })
    : 0;
  return { allowed: used < limits.aiAdvisorPerMonth, used, max: limits.aiAdvisorPerMonth, plan };
}

// Standard "upgrade required" response body returned by gated endpoints. Frontend
// inspects `upgradeRequired: true` to render a special "Upgrade to Pro" CTA.
export function upgradeResponse(feature: string, used: number, max: number, plan: PlanKey) {
  const cap = Number.isFinite(max) ? String(max) : "unlimited";
  return {
    error: `${feature} limit reached for the ${plan} plan (${used}/${cap}). Upgrade to Professional for unlimited access.`,
    upgradeRequired: true,
    plan,
    used,
    max: Number.isFinite(max) ? max : null,
  };
}
