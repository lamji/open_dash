import { NextRequest, NextResponse } from "next/server";
import {
  buildPublishedAccessCookie,
  getPublishedProjectAccessConfig,
  resolvePublishedLoginEndpoint,
} from "@/lib/published-dashboard-auth";

interface PublishedLoginRequestBody {
  layoutId?: string;
  next?: string;
  email?: string;
  password?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PublishedLoginRequestBody;
    const layoutId = body.layoutId?.trim();
    const nextPath = body.next?.trim() || (layoutId ? `/preview/${layoutId}` : "/");
    const email = body.email?.trim();
    const password = body.password ?? "";

    if (!layoutId) {
      return NextResponse.json({ ok: false, error: "Layout ID is required" }, { status: 400 });
    }
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "Email and password are required" }, { status: 400 });
    }

    const accessConfig = await getPublishedProjectAccessConfig(layoutId);
    if (!accessConfig || !accessConfig.loginRequired) {
      return NextResponse.json(
        { ok: false, error: "Published login is not enabled for this dashboard" },
        { status: 400 }
      );
    }

    const loginEndpoint = resolvePublishedLoginEndpoint(accessConfig);
    if (!loginEndpoint) {
      return NextResponse.json(
        { ok: false, error: "Login endpoint is not configured for this dashboard" },
        { status: 400 }
      );
    }

    const remoteResponse = await fetch(loginEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain;q=0.9,*/*;q=0.8",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!remoteResponse.ok) {
      const remoteText = await remoteResponse.text();
      return NextResponse.json(
        {
          ok: false,
          error: `Login endpoint rejected credentials (HTTP ${remoteResponse.status})`,
          response: remoteText || null,
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true, redirectUrl: nextPath });
    response.headers.set("Set-Cookie", buildPublishedAccessCookie(accessConfig.projectId, layoutId));
    return response;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Published login failed",
      },
      { status: 500 }
    );
  }
}
