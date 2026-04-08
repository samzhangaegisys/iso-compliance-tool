import { NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import { setPendingSecret } from "@/lib/mfa-store";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const prisma = getPrisma();
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
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }

  const secret = generateSecret();
  const uri = generateURI({ label: email, issuer: "ISOComply", secret });
  const qrDataUrl = await QRCode.toDataURL(uri, { width: 200, margin: 2 });

  setPendingSecret(email, secret);

  return NextResponse.json({ qrDataUrl, secret });
}
