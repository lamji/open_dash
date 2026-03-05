import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProjectContext, isErrorResponse } from "@/lib/project-auth";

export async function GET(req: Request) {
  console.log(`Debug flow: GET /api/sidebar fired`);
  const ctx = await getProjectContext(req);
  if (isErrorResponse(ctx)) return ctx;

  const items = await prisma.sidebarItem.findMany({
    where: { projectId: ctx.projectId },
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });
  console.log(`Debug flow: GET /api/sidebar returned`, { count: items.length });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  console.log(`Debug flow: POST /api/sidebar fired`);

  const ctx = await getProjectContext(req);
  if (isErrorResponse(ctx)) return ctx;

  const body = (await req.json()) as { label?: string };
  const label = body.label?.trim();
  if (!label) {
    return NextResponse.json({ ok: false, error: "label is required" }, { status: 400 });
  }

  const { projectId } = ctx;
  console.log(`Debug flow: POST /api/sidebar authenticated`, { userId: ctx.userId, projectId });

  const slug = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  try {
    const count = await prisma.sidebarItem.count({
      where: { projectId, parentId: null },
    });

    const item = await prisma.sidebarItem.create({
      data: {
        label,
        slug: `${slug}-${Date.now()}`,
        order: count,
        projectId,
      },
    });

    console.log(`Debug flow: POST /api/sidebar created`, { id: item.id, label: item.label, projectId });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error(`Debug flow: POST /api/sidebar error`, err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to create sidebar item" },
      { status: 500 }
    );
  }
}
