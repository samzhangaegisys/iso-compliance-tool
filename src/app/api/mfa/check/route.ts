import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ mfaRequired: false });
  if (!prisma) return NextResponse.json({ mfaRequired: false });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { mfaEnabled: true },
  });

  return NextResponse.json({ mfaRequired: user?.mfaEnabled ?? false });
}
