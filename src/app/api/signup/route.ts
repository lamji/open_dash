import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, hashPassword, validateEmail, validateName, validatePassword } from "@/lib/auth";

export const runtime = "nodejs";

const SIGNUP_RATE_LIMIT = { max: 3, windowMs: 60 * 60 * 1000 };

function getClientIp(req: NextRequest): string {
  console.log("Debug flow: /api/signup getClientIp fired");
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  console.log("Debug flow: POST /api/signup fired");
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`signup:${ip}`, SIGNUP_RATE_LIMIT.max, SIGNUP_RATE_LIMIT.windowMs);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };

    const nameError = validateName(body.name ?? "");
    const emailError = validateEmail(body.email ?? "");
    const passwordError = validatePassword(body.password ?? "");
    if (nameError || emailError || passwordError) {
      return NextResponse.json({ ok: false, error: nameError || emailError || passwordError }, { status: 400 });
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json({ ok: false, error: "Passwords do not match" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: body.email!.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json({ ok: false, error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password!);
    await prisma.user.create({
      data: {
        email: body.email!.toLowerCase().trim(),
        name: body.name!.trim(),
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true, redirectUrl: "/auth/login" });
  } catch (err) {
    console.error("Debug flow: POST /api/signup error", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
