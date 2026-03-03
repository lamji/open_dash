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

  return NextResponse.json(JSON.parse(config.value));
}
