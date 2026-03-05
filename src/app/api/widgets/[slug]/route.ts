import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  console.log(`Debug flow: GET /api/widgets/[slug] fired with`, { slug });

  try {
    const widget = await prisma.widgetTemplate.findUnique({
      where: { slug },
    });

    if (!widget) {
      console.log(`Debug flow: GET /api/widgets/[slug] widget not found`, { slug });
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    console.log(`Debug flow: GET /api/widgets/[slug] fetched widget`, { slug: widget.slug });
    return NextResponse.json({ widget });
  } catch (error) {
    console.error("Debug flow: GET /api/widgets/[slug] error", error);
    return NextResponse.json({ error: "Failed to fetch widget" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  console.log(`Debug flow: PUT /api/widgets/[slug] fired with`, { slug });

  try {
    const body = await request.json();
    const { data, title, description, category } = body as {
      data?: Record<string, unknown>;
      title?: string;
      description?: string;
      category?: string;
    };

    const existing = await prisma.widgetTemplate.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (data !== undefined) updatePayload.jsxCode = JSON.stringify(data);
    if (title !== undefined) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;
    if (category !== undefined) updatePayload.category = category;

    const updated = await prisma.widgetTemplate.update({
      where: { slug },
      data: updatePayload,
    });

    console.log(`Debug flow: PUT /api/widgets/[slug] updated`, { slug, fields: Object.keys(updatePayload) });
    return NextResponse.json({ widget: updated });
  } catch (error) {
    console.error("Debug flow: PUT /api/widgets/[slug] error", error);
    return NextResponse.json({ error: "Failed to update widget" }, { status: 500 });
  }
}
