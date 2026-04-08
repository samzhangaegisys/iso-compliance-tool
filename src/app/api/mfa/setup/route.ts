import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import { setPendingSecret } from "@/lib/mfa-store";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = generateSecret();
  const uri = generateURI({ label: email, issuer: "ISOComply", secret });
  const qrDataUrl = await QRCode.toDataURL(uri, { width: 200, margin: 2 });

  setPendingSecret(email, secret);

  return NextResponse.json({ qrDataUrl, secret });
}
