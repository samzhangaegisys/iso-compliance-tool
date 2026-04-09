import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!membership) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  const { email, role = "MEMBER" } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const validRoles = ["ADMIN", "MEMBER", "VIEWER"];
  if (!validRoles.includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "No account found with that email. They must register first." },
      { status: 404 }
    );
  }

  const existing = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId: membership.orgId, userId: user.id } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This user is already a member of your organisation." },
      { status: 409 }
    );
  }

  const newMember = await prisma.orgMember.create({
    data: { orgId: membership.orgId, userId: user.id, role },
    include: { user: { select: { name: true, email: true, avatarUrl: true } } },
  });

  return NextResponse.json({
    member: {
      id: newMember.id,
      userId: newMember.userId,
      name: newMember.user.name ?? newMember.user.email,
      email: newMember.user.email,
      avatarUrl: newMember.user.avatarUrl,
      role: newMember.role,
      joinedAt: newMember.createdAt.toISOString(),
    },
  });
}
