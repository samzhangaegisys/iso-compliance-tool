import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

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
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { error: "AI not configured" },
      { status: 503 }
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
      maxTokens: 600,
    });

    return NextResponse.json({ answer: text });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
