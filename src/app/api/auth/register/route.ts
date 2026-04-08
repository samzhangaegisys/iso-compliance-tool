import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { hashPassword } from "@/lib/password";
import { verifyTurnstile } from "@/lib/turnstile";
import { isPasswordStrong } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateRegToken(): string {
  return randomBytes(32).toString("hex");
}

export async function POST(req: Request) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const body = await req.json();
  const { name, email, password, phone, consentTerms, consentMarketing, captchaToken } = body;

  // Validate required fields
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
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

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user (emailVerified = null until OTP verified)
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      phone: phone || null,
      marketingConsent: consentMarketing ?? false,
      emailVerified: null,
      onboardingDone: false,
    },
  });

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

  // In production: send OTP via email (e.g. Resend, SendGrid, AWS SES)
  // For now, log to console for development
  console.log(`\n[ISOComply] Email verification OTP for ${email}: ${otp}\n`);

  return NextResponse.json({ userId: user.id, regToken, otpSent: true });
}
