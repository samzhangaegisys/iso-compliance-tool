import { NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import { setPendingSecret } from "@/lib/mfa-store";
import { auth } from "@/lib/auth";

// GET is also accepted (legacy callers) but POST is the canonical method now.
async function handler() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "You need to be signed in to set up MFA." }, { status: 401 });
  }
  const email = session.user.email;

  const secret = generateSecret();
  const uri = generateURI({ label: email, issuer: "ISOComply", secret });
  const qrDataUrl = await QRCode.toDataURL(uri, { width: 200, margin: 2 });
  setPendingSecret(email, secret);

  return NextResponse.json({ qrDataUrl, secret });
}

export const GET = handler;
export const POST = handler;
