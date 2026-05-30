import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getLimits } from "@/lib/plan-limits";

const ControlPatchSchema = z.object({
  id:          z.string().optional(),
  controlRef:  z.string().min(1).max(50),
  title:       z.string().min(1).max(255),
  description: z.string().max(2000).nullable().optional(),
  guidance:    z.string().max(2000).nullable().optional(),
});

const ClausePatchSchema = z.object({
  id:           z.string().optional(),
  clauseNumber: z.string().min(1).max(50),
  title:        z.string().min(1).max(255),
  controls:     z.array(ControlPatchSchema).max(200),
});

const UpdateFrameworkSchema = z.object({
  name:        z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  version:     z.string().min(1).max(50).optional(),
  clauses:     z.array(ClausePatchSchema).min(1).max(50).optional(),
});

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await ctx.params;
  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ error: "No org" }, { status: 403 });

  const std = await prisma.isoStandard.findFirst({
    where: { id, orgId: membership.orgId },
    include: {
      clauses: {
        orderBy: { clauseNumber: "asc" },
        include: { controls: { orderBy: { controlRef: "asc" } } },
      },
    },
  });
  if (!std) return NextResponse.json({ error: "Custom framework not found." }, { status: 404 });

  return NextResponse.json({
    framework: {
      id: std.id,
      code: std.code,
      name: std.name,
      description: std.description,
      version: std.version,
      isCustom: true,
      clauses: std.clauses.map((cl) => ({
        id: cl.id,
        clauseNumber: cl.clauseNumber,
        title: cl.title,
        controls: cl.controls.map((ctrl) => ({
          id: ctrl.id,
          controlRef: ctrl.controlRef,
          title: ctrl.title,
          description: ctrl.description,
          guidance: ctrl.guidance,
        })),
      })),
    },
  });
}

export async function PATCH(req: Request, ctx: RouteCtx) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await ctx.params;
  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!membership) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  const { plan } = await getLimits(membership.orgId);
  if (plan !== "ENTERPRISE") {
    return NextResponse.json({ error: "Enterprise only.", upgradeRequired: true }, { status: 402 });
  }

  // Must be an org-owned custom framework.
  const existing = await prisma.isoStandard.findFirst({
    where: { id, orgId: membership.orgId },
    include: { clauses: { include: { controls: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Custom framework not found." }, { status: 404 });

  const parsed = UpdateFrameworkSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { name, description, version, clauses } = parsed.data;

  await prisma.$transaction(async (tx) => {
    if (name !== undefined || description !== undefined || version !== undefined) {
      await tx.isoStandard.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(version !== undefined && { version }),
        },
      });
    }

    if (!clauses) return;

    // Smart diff: preserve IDs that are still present in the payload so existing
    // ProjectControl / Evidence links survive. Items not referenced get deleted.
    const incomingClauseIds = new Set(clauses.map((c) => c.id).filter((x): x is string => !!x));
    const clausesToDelete = existing.clauses.filter((c) => !incomingClauseIds.has(c.id));
    if (clausesToDelete.length > 0) {
      await tx.isoClause.deleteMany({ where: { id: { in: clausesToDelete.map((c) => c.id) } } });
    }

    for (const cl of clauses) {
      if (cl.id) {
        const existingClause = existing.clauses.find((ec) => ec.id === cl.id);
        if (!existingClause) continue; // ID provided but stale — skip silently
        await tx.isoClause.update({
          where: { id: cl.id },
          data: { clauseNumber: cl.clauseNumber, title: cl.title },
        });
        const incomingControlIds = new Set(cl.controls.map((c) => c.id).filter((x): x is string => !!x));
        const controlsToDelete = existingClause.controls.filter((c) => !incomingControlIds.has(c.id));
        if (controlsToDelete.length > 0) {
          await tx.isoControl.deleteMany({ where: { id: { in: controlsToDelete.map((c) => c.id) } } });
        }
        for (const ctrl of cl.controls) {
          if (ctrl.id && existingClause.controls.some((c) => c.id === ctrl.id)) {
            await tx.isoControl.update({
              where: { id: ctrl.id },
              data: {
                controlRef: ctrl.controlRef,
                title: ctrl.title,
                description: ctrl.description ?? null,
                guidance: ctrl.guidance ?? null,
              },
            });
          } else {
            await tx.isoControl.create({
              data: {
                clauseId: cl.id,
                controlRef: ctrl.controlRef,
                title: ctrl.title,
                description: ctrl.description ?? null,
                guidance: ctrl.guidance ?? null,
              },
            });
          }
        }
      } else {
        await tx.isoClause.create({
          data: {
            standardId: id,
            clauseNumber: cl.clauseNumber,
            title: cl.title,
            controls: {
              create: cl.controls.map((ctrl) => ({
                controlRef: ctrl.controlRef,
                title: ctrl.title,
                description: ctrl.description ?? null,
                guidance: ctrl.guidance ?? null,
              })),
            },
          },
        });
      }
    }
  });

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "framework.updated",
    entityId: id,
    meta: { name: name ?? existing.name, clauseCount: clauses?.length },
  });

  return NextResponse.json({ success: true });
}
