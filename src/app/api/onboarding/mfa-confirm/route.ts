import { NextResponse } from "next/server";
import { verifySync } from "otplib";
import { getMfaRecord, enableMfa } from "@/lib/mfa-store";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const { userId, email, regToken, code } = await req.json();
  if (!userId || !email || !regToken || !code) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Validate registration token
  const regRecord = await prisma.verificationToken.findFirst({
    where: { identifier: `reg:${userId}`, token: regToken, expires: { gt: new Date() } },
  });
  if (!regRecord) {
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }

  const record = getMfaRecord(email);
  if (!record?.pendingSecret) {
    return NextResponse.json({ error: "No MFA setup in progress. Please scan the QR code first." }, { status: 400 });
  }

  const result = verifySync({ secret: record.pendingSecret, token: code });
  const valid = typeof result === "object" ? result.valid : result;
  if (!valid) {
    return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });
  }

  enableMfa(email);
  return NextResponse.json({ success: true });
}
