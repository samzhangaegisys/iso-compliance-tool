import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!prisma) {
    return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 });
  }

  const { userId, regToken, email } = await req.json();
  if (!userId || !regToken || !email) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // 60s cooldown per email; backed by a per-IP burst guard for abuse protection.
  if (!rateLimit(`resend-otp-cooldown:${email}`, 1, 60 * 1000)) {
    return NextResponse.json({ error: "Please wait 60 seconds before requesting another code." }, { status: 429 });
  }
  if (!rateLimit(`resend-otp-ip:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many resend attempts from this network. Please try again later." }, { status: 429 });
  }

  // Validate the registration session
  const regRecord = await prisma.verificationToken.findFirst({
    where: { identifier: `reg:${userId}`, token: regToken, expires: { gt: new Date() } },
  });
  if (!regRecord) {
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.email !== email) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Replace any existing OTP for this email
  const otp = generateOtp();
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.verificationToken.deleteMany({ where: { identifier: `otp:${email}` } });
  await prisma.verificationToken.create({
    data: { identifier: `otp:${email}`, token: otp, expires },
  });

  let otpSent = false;
  try {
    await sendVerificationEmail(email, otp, user.name ?? email);
    otpSent = true;
  } catch (err) {
    console.error(`[ISOComply] Failed to resend verification email to ${email}:`, err);
  }

  const exposeOtp = process.env.VERCEL_ENV !== "production";
  return NextResponse.json({ otpSent, ...(exposeOtp ? { devOtp: otp } : {}) });
}
