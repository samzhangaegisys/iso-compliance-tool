import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkAiAdvisorQuota, upgradeResponse } from "@/lib/plan-limits";
import { writeAuditLog } from "@/lib/audit";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
});

const schema = z.object({
  question: z.string().min(1).max(1000),
  controlRef: z.string().optional(),
  controlTitle: z.string().optional(),
  controlDescription: z.string().optional(),
  controlGuidance: z.string().optional(),
  controlRisk: z.string().optional(),
  standardCode: z.string().optional(),
  standardName: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { error: "AI not configured" },
      { status: 503 }
    );
  }

  // Look up the user's org and gate against the monthly AI Advisor quota.
  // Starter: 10/mo per workspace. Pro+: unlimited.
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 503 });
  }
  const membership = await prisma.orgMember.findFirst({ where: { userId: session.user.id } });
  if (!membership) {
    return NextResponse.json({ error: "No organisation found" }, { status: 400 });
  }
  const quota = await checkAiAdvisorQuota(membership.orgId);
  if (!quota.allowed) {
    return NextResponse.json(
      upgradeResponse("AI Compliance Advisor queries this month", quota.used, quota.max, quota.plan),
      { status: 402 },
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const {
    question,
    controlRef,
    controlTitle,
    controlDescription,
    controlGuidance,
    controlRisk,
    standardCode,
    standardName,
  } = parsed.data;

  const systemPrompt = `You are an expert ISO compliance advisor helping organisations achieve certification.
Be concise, practical, and specific. Format responses with markdown (bold, bullet points, line breaks).
Keep answers under 300 words. Focus on actionable advice.
Standard in scope: ${standardName ?? standardCode ?? "ISO"}.
${
  controlRef
    ? `Current control: ${controlRef} — ${controlTitle} (${controlRisk} risk)
Description: ${controlDescription}
Guidance: ${controlGuidance}`
    : ""
}`;

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      system: systemPrompt,
      prompt: question,
      maxOutputTokens: 600,
    });

    // Log the usage event — checkAiAdvisorQuota counts these to enforce the monthly cap.
    await writeAuditLog({
      orgId: membership.orgId,
      userId: session.user.id,
      userName: session.user.name ?? session.user.email ?? "Unknown",
      action: "ai.advisor_query",
      meta: { standardCode, controlRef },
    });

    return NextResponse.json({ answer: text });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
