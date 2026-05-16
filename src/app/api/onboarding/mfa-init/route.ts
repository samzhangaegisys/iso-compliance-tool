import { NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import { setPendingSecret } from "@/lib/mfa-store";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const regToken = searchParams.get("regToken");
  const email = searchParams.get("email");

  if (!userId || !regToken || !email) {
    return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
  }

  // Validate registration token
  const regRecord = await prisma.verificationToken.findFirst({
    where: { identifier: `reg:${userId}`, token: regToken, expires: { gt: new Date() } },
  });
  if (!regRecord) {
    const dbToken = await prisma.verificationToken.findFirst({
      where: { identifier: `reg:${userId}` },
      select: { token: true, expires: true },
    });
    console.log("[mfa-init] 401 reg session invalid", {
      userId, email,
      regTokenLen: regToken.length, regTokenPrefix: regToken.slice(0, 12),
      dbTokenPrefix: dbToken?.token?.slice(0, 12) ?? null,
      dbExpires: dbToken?.expires ?? null,
      now: new Date().toISOString(),
      tokenMatches: dbToken?.token === regToken,
    });
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }

  const secret = generateSecret();
  const uri = generateURI({ label: email, issuer: "ISOComply", secret });
  const qrDataUrl = await QRCode.toDataURL(uri, { width: 200, margin: 2 });

  setPendingSecret(email, secret);

  return NextResponse.json({ qrDataUrl, secret });
}
