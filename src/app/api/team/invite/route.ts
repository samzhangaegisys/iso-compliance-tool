import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { sendTeamInviteEmail } from "@/lib/email";

const InviteSchema = z.object({
  email:     z.string().email().max(254),
  role:      z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
  firstName: z.string().max(50).optional(),
  lastName:  z.string().max(50).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
    include: { org: true },
  });
  if (!membership) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  const parsed = InviteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { email, role, firstName, lastName } = parsed.data;

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

  const fullName = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");

  const newMember = await prisma.orgMember.create({
    data: { orgId: membership.orgId, userId: user.id, role },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://isocomply.io";
  await sendTeamInviteEmail(
    email,
    session.user.name ?? session.user.email ?? "A team member",
    membership.org.name,
    role,
    `${baseUrl}/login`,
  ).catch(() => {});

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "team.member_invited",
    entityId: newMember.id,
    meta: { invitedEmail: email, role },
  });

  return NextResponse.json({
    member: {
      id: newMember.id,
      userId: newMember.userId,
      name: fullName || user.name || user.email,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: newMember.role,
      joinedAt: newMember.createdAt.toISOString(),
    },
  });
}
