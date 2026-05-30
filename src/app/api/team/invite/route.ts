import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { sendTeamInviteEmail } from "@/lib/email";
import { checkUserLimit, upgradeResponse } from "@/lib/plan-limits";

const InviteSchema = z.object({
  email:     z.string().email().max(254),
  role:      z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
  firstName: z.string().max(50).optional(),
  lastName:  z.string().max(50).optional(),
});

const INVITE_TTL_DAYS = 14;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
    include: { organisation: true },
  });
  if (!membership) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  // Plan seat cap (Starter: 5 fixed; Pro+: unlimited). Both existing-user and
  // pending-invite paths consume a seat — Pending invites pre-allocate the slot.
  const seatLimit = await checkUserLimit(membership.orgId);
  if (!seatLimit.allowed) {
    return NextResponse.json(
      upgradeResponse("Team members", seatLimit.used, seatLimit.max, seatLimit.plan),
      { status: 402 },
    );
  }

  const parsed = InviteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { email, role, firstName, lastName } = parsed.data;
  const normalisedEmail = email.toLowerCase().trim();

  const inviterName = session.user.name ?? session.user.email ?? "A team member";
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://isocomply.io";

  const existingUser = await prisma.user.findUnique({ where: { email: normalisedEmail } });

  // ─── Existing user path ────────────────────────────────────────────────────
  if (existingUser) {
    const alreadyMember = await prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId: membership.orgId, userId: existingUser.id } },
    });
    if (alreadyMember) {
      return NextResponse.json(
        { error: "This user is already a member of your organisation." },
        { status: 409 },
      );
    }

    const fullName = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ");
    const newMember = await prisma.orgMember.create({
      data: { orgId: membership.orgId, userId: existingUser.id, role },
    });

    await sendTeamInviteEmail(
      normalisedEmail, inviterName, membership.organisation.name, role, `${baseUrl}/login`,
    ).catch(() => {});

    await writeAuditLog({
      orgId: membership.orgId,
      userId: session.user.id,
      userName: inviterName,
      action: "team.member_invited",
      entityId: newMember.id,
      meta: { invitedEmail: normalisedEmail, role, mode: "existing_user" },
    });

    return NextResponse.json({
      member: {
        id: newMember.id,
        userId: newMember.userId,
        name: fullName || existingUser.name || existingUser.email,
        email: existingUser.email,
        avatarUrl: existingUser.avatarUrl,
        role: newMember.role,
        joinedAt: newMember.createdAt.toISOString(),
      },
    });
  }

  // ─── Pending invite path (recipient has no account) ────────────────────────
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000);

  // Upsert so resending an invite to the same email refreshes the token and
  // expiry instead of failing on the @@unique([orgId, email]) constraint.
  const invite = await prisma.teamInvite.upsert({
    where: { orgId_email: { orgId: membership.orgId, email: normalisedEmail } },
    update: {
      role,
      token,
      expiresAt,
      invitedBy: session.user.id,
      inviterName,
      acceptedAt: null,
    },
    create: {
      orgId: membership.orgId,
      email: normalisedEmail,
      role,
      token,
      expiresAt,
      invitedBy: session.user.id,
      inviterName,
    },
  });

  const signupUrl = `${baseUrl}/register?invite=${encodeURIComponent(token)}`;
  await sendTeamInviteEmail(
    normalisedEmail, inviterName, membership.organisation.name, role, signupUrl,
  ).catch(() => {});

  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: inviterName,
    action: "team.invite_sent",
    entityId: invite.id,
    meta: { invitedEmail: normalisedEmail, role, mode: "pending_invite", expiresAt: expiresAt.toISOString() },
  });

  return NextResponse.json({
    pendingInvite: {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString(),
    },
  });
}

// DELETE — revoke a pending invite (Owner/Admin only).
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing invite id." }, { status: 400 });

  const membership = await prisma.orgMember.findFirst({
    where: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } },
  });
  if (!membership) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

  const invite = await prisma.teamInvite.findFirst({
    where: { id, orgId: membership.orgId },
  });
  if (!invite) return NextResponse.json({ error: "Invite not found." }, { status: 404 });

  await prisma.teamInvite.delete({ where: { id } });
  await writeAuditLog({
    orgId: membership.orgId,
    userId: session.user.id,
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: "team.invite_revoked",
    entityId: id,
    meta: { email: invite.email },
  });

  return NextResponse.json({ success: true });
}
