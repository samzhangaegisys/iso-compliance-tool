import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const { userId, email, otp, regToken } = await req.json();
  if (!userId || !email || !otp || !regToken) {
    console.log("[verify-email] 400 missing fields", { hasUserId: !!userId, hasEmail: !!email, hasOtp: !!otp, hasRegToken: !!regToken });
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Validate registration token
  const regRecord = await prisma.verificationToken.findFirst({
    where: { identifier: `reg:${userId}`, token: regToken, expires: { gt: new Date() } },
  });
  if (!regRecord) {
    // Diagnostic: dump what we received vs what's in the DB for this identifier
    const matchingByIdentifier = await prisma.verificationToken.findFirst({
      where: { identifier: `reg:${userId}` },
      select: { token: true, expires: true },
    });
    console.log("[verify-email] 401 reg session invalid", {
      userId,
      regTokenLen: regToken.length,
      regTokenPrefix: regToken.slice(0, 12),
      dbTokenPrefix: matchingByIdentifier?.token?.slice(0, 12) ?? null,
      dbExpires: matchingByIdentifier?.expires ?? null,
      now: new Date().toISOString(),
      tokenMatches: matchingByIdentifier?.token === regToken,
    });
    return NextResponse.json({ error: "Invalid or expired session. Please restart registration." }, { status: 401 });
  }

  // Validate OTP
  const otpRecord = await prisma.verificationToken.findFirst({
    where: { identifier: `otp:${email}`, token: otp, expires: { gt: new Date() } },
  });
  if (!otpRecord) {
    return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 });
  }

  // Mark email as verified
  const user = await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });

  // Clean up OTP token
  await prisma.verificationToken.deleteMany({
    where: { identifier: `otp:${email}` },
  });

  await sendWelcomeEmail(email, user.name ?? email).catch(() => {});

  return NextResponse.json({ success: true });
}
