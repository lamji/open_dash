import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProjectContext, isErrorResponse } from "@/lib/project-auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const ctx = await getProjectContext(req);
  if (isErrorResponse(ctx)) return ctx;

  const { key } = await params;
  const config = await prisma.appConfig.findFirst({
    where: { key, projectId: ctx.projectId },
  });

  if (!config) {
    return NextResponse.json(null, { status: 200 });
  }

  // For page_html_content, return raw HTML string without JSON parsing
  if (key === "page_html_content") {
    return NextResponse.json(config.value);
  }

  return NextResponse.json(JSON.parse(config.value));
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  console.log(`Debug flow: PUT /api/config/[key] fired`);
  const ctx = await getProjectContext(req);
  if (isErrorResponse(ctx)) return ctx;

  const { key } = await params;
  const body = await req.json();
  console.log(`Debug flow: PUT /api/config/[key] params`, { key, projectId: ctx.projectId });

  const config = await prisma.appConfig.upsert({
    where: {
      key_projectId: {
        key,
        projectId: ctx.projectId,
      },
    },
    update: {
      value: JSON.stringify(body ?? {}),
    },
    create: {
      key,
      projectId: ctx.projectId,
      value: JSON.stringify(body ?? {}),
    },
  });

  return NextResponse.json({
    ok: true,
    key: config.key,
    value: body ?? {},
  });
}
