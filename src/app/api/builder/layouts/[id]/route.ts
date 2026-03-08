import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/auth";
import {
  getPublishedProjectAccessConfig,
  PUBLISHED_DASHBOARD_COOKIE_NAME,
  validatePublishedAccessToken,
} from "@/lib/published-dashboard-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`Debug flow: GET /api/builder/layouts/[id] fired`, { id });

  try {
    const accessConfig = await getPublishedProjectAccessConfig(id);
    if (accessConfig?.loginRequired) {
      const cookieStore = await cookies();
      const publishedToken = cookieStore.get(PUBLISHED_DASHBOARD_COOKIE_NAME)?.value;
      const hasPublishedAccess =
        !!publishedToken &&
        validatePublishedAccessToken(publishedToken, accessConfig.projectId, id);

      if (!hasPublishedAccess) {
        const builderToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        const builderSession = builderToken ? await validateSession(builderToken) : null;
        if (!builderSession?.user) {
          return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }
      }
    }

    const record = await prisma.dashboardLayout.findUnique({ where: { id } });

    if (!record) {
      return NextResponse.json({ ok: false, error: "Layout not found" }, { status: 404 });
    }

    let layout = [];
    try {
      layout = JSON.parse(record.layout);
    } catch {
      layout = [];
    }

    console.log(`Debug flow: GET /api/builder/layouts/[id] found`, { id, name: record.name });

    const response = NextResponse.json({
      ok: true,
      layout: {
        id: record.id,
        name: record.name,
        layout,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      },
    });
    response.headers.set(
      "Cache-Control",
      "public, max-age=30, s-maxage=120, stale-while-revalidate=600"
    );
    return response;
  } catch (err) {
    console.error(`Debug flow: GET /api/builder/layouts/[id] error`, err);
    return NextResponse.json({ ok: false, error: "Failed to fetch layout" }, { status: 500 });
  }
}
