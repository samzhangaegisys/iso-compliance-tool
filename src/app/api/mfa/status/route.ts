import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMfaRecord } from "@/lib/mfa-store";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const record = await getMfaRecord(email);
  return NextResponse.json({ enabled: record?.enabled ?? false });
}
