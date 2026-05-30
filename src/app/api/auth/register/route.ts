import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { hashPassword } from "@/lib/password";
import { verifyTurnstile } from "@/lib/turnstile";
import { isPasswordStrong } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

const RegisterSchema = z.object({
  name:              z.string().min(1).max(100),
  email:             z.string().email().max(254),
  password:          z.string().min(8).max(128),
  phone:             z.string().max(30).optional(),
  consentTerms:      z.boolean(),
  consentMarketing:  z.boolean().optional().default(false),
  captchaToken:      z.string().optional(),
  // When set, the signup is a team-invite acceptance: the new user joins the
  // inviter's organisation instead of creating their own. Comes from the
  // /register?invite=<token> URL on the email signup link.
  inviteToken:       z.string().optional(),
});

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateRegToken(): string {
  return randomBytes(32).toString("hex");
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!rateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
  }

  if (!prisma) {
    const hint = process.env.NODE_ENV === "development"
      ? "Database not connected. Check DATABASE_URL in .env.local."
      : "Service temporarily unavailable. Please try again shortly.";
    return NextResponse.json({ error: hint }, { status: 503 });
  }

  const rawBody = await req.json();
  const parsed = RegisterSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { name, email, password, phone, consentTerms, consentMarketing, captchaToken, inviteToken } = parsed.data;

  if (!consentTerms) {
    return NextResponse.json({ error: "You must agree to the Terms of Service and Privacy Policy." }, { status: 400 });
  }
  if (!isPasswordStrong(password)) {
    return NextResponse.json({ error: "Password does not meet the complexity requirements." }, { status: 400 });
  }

  // Validate captcha
  if (captchaToken) {
    const captchaValid = await verifyTurnstile(captchaToken);
    if (!captchaValid) {
      return NextResponse.json({ error: "Human verification failed. Please try again." }, { status: 400 });
    }
  }

  // Check if email already registered
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  // If an invite token was supplied, validate it matches this email and is
  // still active. Mismatches fail closed — we don't silently fall back to
  // "create your own org" so a recipient can't accidentally end up outside
  // the org that paid for their seat.
  let pendingInvite: { id: string; orgId: string; role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" } | null = null;
  if (inviteToken) {
    const found = await prisma.teamInvite.findUnique({ where: { token: inviteToken } });
    if (!found) {
      return NextResponse.json({ error: "This invite link is invalid or has been revoked." }, { status: 400 });
    }
    if (found.acceptedAt) {
      return NextResponse.json({ error: "This invite has already been used." }, { status: 400 });
    }
    if (found.expiresAt < new Date()) {
      return NextResponse.json({ error: "This invite link has expired. Ask the inviter to send a new one." }, { status: 400 });
    }
    if (found.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "This invite was sent to a different email address." }, { status: 400 });
    }
    pendingInvite = { id: found.id, orgId: found.orgId, role: found.role };
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user (emailVerified = null until OTP verified). Invite recipients
  // skip the org-creation onboarding step since they're joining an existing org.
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      phone: phone || null,
      marketingConsent: consentMarketing ?? false,
      emailVerified: null,
      onboardingDone: pendingInvite !== null,
    },
  });

  // Consume the invite: join the user to the inviter's org and mark accepted.
  // Done in a transaction so a partially-completed join can't leave a dangling
  // OrgMember without the matching invite-accepted marker.
  if (pendingInvite) {
    await prisma.$transaction([
      prisma.orgMember.create({
        data: { orgId: pendingInvite.orgId, userId: user.id, role: pendingInvite.role },
      }),
      prisma.teamInvite.update({
        where: { id: pendingInvite.id },
        data: { acceptedAt: new Date() },
      }),
    ]);
  }

  // Generate OTP (6-digit) + registration token
  const otp = generateOtp();
  const regToken = generateRegToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store OTP
  await prisma.verificationToken.create({
    data: {
      identifier: `otp:${email}`,
      token: otp,
      expires,
    },
  });

  // Store registration session token
  await prisma.verificationToken.create({
    data: {
      identifier: `reg:${user.id}`,
      token: regToken,
      expires,
    },
  });

  let otpSent = false;
  try {
    await sendVerificationEmail(email, otp, name);
    otpSent = true;
  } catch (err) {
    console.error(`[ISOComply] Failed to send verification email to ${email}:`, err);
  }
  if (process.env.NODE_ENV === "development") {
    console.log(`\n[ISOComply] Email verification OTP for ${email}: ${otp}\n`);
  }

  // Outside real production (local dev + Vercel preview/staging), return the OTP
  // so the verification flow is testable without a verified Resend sending domain.
  const exposeOtp = process.env.VERCEL_ENV !== "production";
  return NextResponse.json({
    userId: user.id,
    regToken,
    otpSent,
    ...(exposeOtp ? { devOtp: otp } : {}),
  });
}
