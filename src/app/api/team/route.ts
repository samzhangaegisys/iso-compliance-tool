import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ members: [] });
  if (!prisma) return NextResponse.json({ members: [] });

  // Find user's org
  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return NextResponse.json({ members: [] });

  const members = await prisma.orgMember.findMany({
    where: { orgId: membership.orgId },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    members: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name ?? m.user.email,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      joinedAt: m.createdAt.toISOString(),
    })),
  });
}
