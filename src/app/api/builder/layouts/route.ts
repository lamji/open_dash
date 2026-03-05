import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import type { LayoutBlock } from "@/domain/builder/types";

async function getAuthenticatedUserId(): Promise<string | null> {
  console.log(`Debug flow: getAuthenticatedUserId fired`);
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const result = await validateSession(token);
  return result?.user?.id ?? null;
}

export async function POST(request: NextRequest) {
  console.log(`Debug flow: POST /api/builder/layouts fired`);

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    console.log(`Debug flow: POST /api/builder/layouts unauthorized`);
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, layout } = body as { name: string; layout: LayoutBlock[] };

    if (!layout || !Array.isArray(layout)) {
      return NextResponse.json({ ok: false, error: "layout array is required" }, { status: 400 });
    }

    const record = await prisma.dashboardLayout.create({
      data: {
        name: (name?.trim() || "My Dashboard"),
        layout: JSON.stringify(layout),
      },
    });

    console.log(`Debug flow: POST /api/builder/layouts created`, { id: record.id, name: record.name, userId });

    return NextResponse.json({
      ok: true,
      layout: {
        id: record.id,
        name: record.name,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error(`Debug flow: POST /api/builder/layouts error`, err);
    return NextResponse.json({ ok: false, error: "Failed to save layout" }, { status: 500 });
  }
}

export async function GET() {
  console.log(`Debug flow: GET /api/builder/layouts fired`);

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    console.log(`Debug flow: GET /api/builder/layouts unauthorized`);
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const records = await prisma.dashboardLayout.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    console.log(`Debug flow: GET /api/builder/layouts returned`, { count: records.length, userId });
    return NextResponse.json({
      ok: true,
      layouts: records.map((r) => ({
        id: r.id,
        name: r.name,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error(`Debug flow: GET /api/builder/layouts error`, err);
    return NextResponse.json({ ok: false, error: "Failed to fetch layouts" }, { status: 500 });
  }
}
