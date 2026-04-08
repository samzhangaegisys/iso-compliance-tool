import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const { userId, email, otp, regToken } = await req.json();
  if (!userId || !email || !otp || !regToken) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Validate registration token
  const regRecord = await prisma.verificationToken.findFirst({
    where: { identifier: `reg:${userId}`, token: regToken, expires: { gt: new Date() } },
  });
  if (!regRecord) {
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
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });

  // Clean up OTP token
  await prisma.verificationToken.deleteMany({
    where: { identifier: `otp:${email}` },
  });

  return NextResponse.json({ success: true });
}
