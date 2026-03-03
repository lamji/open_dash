import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  checkRateLimit,
  buildSessionCookie,
  buildLogoutCookie,
  validateEmail,
  validatePassword,
  validateName,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

const LOGIN_RATE_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };
const SIGNUP_RATE_LIMIT = { max: 3, windowMs: 60 * 60 * 1000 };

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    // Validate DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.error("[AUTH] DATABASE_URL is not set");
      return NextResponse.json(
        { ok: false, error: "Database configuration error" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === "login") return handleLogin(req, body);
    if (action === "signup") return handleSignup(req, body);
    if (action === "logout") return handleLogout(req);

    return NextResponse.json(
      { ok: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[AUTH] POST handler error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleLogin(
  req: NextRequest,
  body: { email?: string; password?: string }
) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(
    `login:${ip}`,
    LOGIN_RATE_LIMIT.max,
    LOGIN_RATE_LIMIT.windowMs
  );
  if (!rateCheck.allowed) {
    const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60000);
    return NextResponse.json(
      {
        ok: false,
        error: `Too many login attempts. Try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
      },
      { status: 429 }
    );
  }

  const emailError = validateEmail(body.email ?? "");
  const passwordError = validatePassword(body.password ?? "");
  if (emailError || passwordError) {
    return NextResponse.json(
      { ok: false, error: emailError || passwordError },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email!.toLowerCase().trim() },
  });

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(body.password!, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = await createSession(user.id);

  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    },
    redirectUrl: "/dashboard",
  });

  response.headers.set("Set-Cookie", buildSessionCookie(token));
  return response;
}

async function handleSignup(
  req: NextRequest,
  body: { name?: string; email?: string; password?: string; confirmPassword?: string }
) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(
    `signup:${ip}`,
    SIGNUP_RATE_LIMIT.max,
    SIGNUP_RATE_LIMIT.windowMs
  );
  if (!rateCheck.allowed) {
    const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60000);
    return NextResponse.json(
      {
        ok: false,
        error: `Too many signup attempts. Try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
      },
      { status: 429 }
    );
  }

  const nameError = validateName(body.name ?? "");
  const emailError = validateEmail(body.email ?? "");
  const passwordError = validatePassword(body.password ?? "");
  if (nameError || emailError || passwordError) {
    return NextResponse.json(
      { ok: false, error: nameError || emailError || passwordError },
      { status: 400 }
    );
  }

  if (body.password !== body.confirmPassword) {
    return NextResponse.json(
      { ok: false, error: "Passwords do not match" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: body.email!.toLowerCase().trim() },
  });

  if (existing) {
    return NextResponse.json(
      { ok: false, error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(body.password!);

  await prisma.user.create({
    data: {
      email: body.email!.toLowerCase().trim(),
      name: body.name!.trim(),
      passwordHash,
    },
  });

  return NextResponse.json({
    ok: true,
    redirectUrl: "/auth/login",
  });
}

async function handleLogout(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await deleteSession(token);
  }

  const response = NextResponse.json({ ok: true, redirectUrl: "/" });
  response.headers.set("Set-Cookie", buildLogoutCookie());
  return response;
}
