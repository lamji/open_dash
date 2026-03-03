import { NextResponse } from "next/server";
import { validatePrompt } from "@/lib/playwright-validator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, componentIds } = body as {
      prompt: string;
      componentIds: string[];
    };

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const result = await validatePrompt(prompt, componentIds || []);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      {
        passed: false,
        intent: "Validation failed",
        expected: "Validation to complete",
        actual: "Error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
