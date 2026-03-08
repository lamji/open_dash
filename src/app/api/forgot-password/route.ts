import { NextRequest, NextResponse } from "next/server";
import { validateEmail } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  console.log("Debug flow: POST /api/forgot-password fired");
  try {
    const body = (await req.json()) as { email?: string };
    const emailError = validateEmail(body.email ?? "");
    if (emailError) {
      return NextResponse.json({ ok: false, error: emailError }, { status: 400 });
    }

    // Intentionally does not reveal account existence.
    return NextResponse.json({
      ok: true,
      message: "If an account exists for this email, reset instructions were sent.",
    });
  } catch (err) {
    console.error("Debug flow: POST /api/forgot-password error", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
