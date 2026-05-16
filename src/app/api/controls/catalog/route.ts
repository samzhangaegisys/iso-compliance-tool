import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Returns the full IsoStandard → IsoClause → IsoControl catalog for every standard
// the org has at least one ComplianceProject against. Used by the cross-mapping UI
// to populate the source / target dropdowns. Only catalog entries (no project state).
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ standards: [] });
  if (!prisma) return NextResponse.json({ standards: [] });

  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) return NextResponse.json({ standards: [] });

  // standardIds the org has projects against
  const projects = await prisma.complianceProject.findMany({
    where: { orgId: membership.orgId },
    select: { standardId: true },
  });
  const standardIds = Array.from(new Set(projects.map((p) => p.standardId)));
  if (standardIds.length === 0) return NextResponse.json({ standards: [] });

  const standards = await prisma.isoStandard.findMany({
    where: { id: { in: standardIds } },
    include: {
      clauses: {
        include: { controls: true },
        orderBy: { clauseNumber: "asc" },
      },
    },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({
    standards: standards.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      clauses: s.clauses.map((c) => ({
        clauseNumber: c.clauseNumber,
        title: c.title,
        controls: c.controls.map((ctrl) => ({
          id: ctrl.id,
          controlRef: ctrl.controlRef,
          title: ctrl.title,
        })),
      })),
    })),
  });
}
