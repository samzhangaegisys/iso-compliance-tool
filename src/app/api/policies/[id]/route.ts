import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getLimits, upgradeResponse } from "@/lib/plan-limits";

const CATEGORIES = [
  "INFOSEC", "ACCEPTABLE_USE", "DATA_RETENTION", "INCIDENT_RESPONSE",
  "ACCESS_CONTROL", "BUSINESS_CONTINUITY", "CHANGE_MANAGEMENT",
  "THIRD_PARTY", "PRIVACY", "OTHER",
] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

// PATCH supports metadata-only updates (status, title, category, owner, review date).
// If `content` is provided, we create a new version + bump currentVersion.
const UpdatePolicySchema = z.object({
  title:          z.string().min(1).max(255).optional(),
  description:    z.string().max(2000).nullable().optional(),
  category:       z.enum(CATEGORIES).optional(),
  status:         z.enum(STATUSES).optional(),
  ownerId:        z.string().cuid().nullable().optional(),
  nextReviewDate: z.string().datetime().nullable().optional(),
  content:        z.string().min(1).max(200_000).optional(),
  changeNotes:    z.string().max(1000).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;
  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const policy = await prisma.policy.findFirst({
    where: { id, orgId: membership.orgId },
    include: { versions: { orderBy: { version: "desc" }, take: 20 } },
  });
  if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });

  return NextResponse.json({
    policy: {
      ...policy,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
      nextReviewDate: policy.nextReviewDate?.toISOString() ?? null,
      versions: policy.versions.map((v) => ({
        ...v,
        createdAt: v.createdAt.toISOString(),
      })),
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;
  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await getLimits(membership.orgId);
  if (plan === "STARTER") {
    return NextResponse.json(upgradeResponse("Policy library", 0, 0, plan), { status: 402 });
  }

  const policy = await prisma.policy.findFirst({ where: { id, orgId: membership.orgId } });
  if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });

  const parsed = UpdatePolicySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const d = parsed.data;

  let ownerName: string | null | undefined = undefined;
  if (d.ownerId !== undefined) {
    if (d.ownerId === null) ownerName = null;
    else {
      const owner = await prisma.user.findUnique({ where: { id: d.ownerId }, select: { name: true, email: true } });
      ownerName = owner?.name ?? owner?.email ?? null;
    }
  }

  // If new content is provided, create a new version row and bump currentVersion.
  const nextVersion = d.content ? policy.currentVersion + 1 : policy.currentVersion;
  const updated = await prisma.policy.update({
    where: { id },
    data: {
      ...(d.title !== undefined && { title: d.title }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.category !== undefined && { category: d.category }),
      ...(d.status !== undefined && { status: d.status }),
      ...(d.ownerId !== undefined && { ownerId: d.ownerId }),
      ...(ownerName !== undefined && { ownerName }),
      ...(d.nextReviewDate !== undefined && { nextReviewDate: d.nextReviewDate ? new Date(d.nextReviewDate) : null }),
      ...(d.content && {
        currentVersion: nextVersion,
        versions: {
          create: {
            version: nextVersion,
            content: d.content,
            changeNotes: d.changeNotes,
            createdBy: session.user.name ?? session.user.email ?? "Unknown",
          },
        },
      }),
    },
  });

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: d.content ? "policy.version_published" : "policy.updated",
    entityId: updated.id,
    meta: { changed: Object.keys(d), newVersion: d.content ? nextVersion : undefined },
  });

  return NextResponse.json({ policy: { ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() } });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;
  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const policy = await prisma.policy.findFirst({ where: { id, orgId: membership.orgId } });
  if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });

  await prisma.policy.delete({ where: { id } });
  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "policy.deleted",
    entityId: id,
    meta: { title: policy.title },
  });
  return NextResponse.json({ success: true });
}
