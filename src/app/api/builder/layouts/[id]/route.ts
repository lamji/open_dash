import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`Debug flow: GET /api/builder/layouts/[id] fired`, { id });

  try {
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

    return NextResponse.json({
      ok: true,
      layout: {
        id: record.id,
        name: record.name,
        layout,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error(`Debug flow: GET /api/builder/layouts/[id] error`, err);
    return NextResponse.json({ ok: false, error: "Failed to fetch layout" }, { status: 500 });
  }
}
