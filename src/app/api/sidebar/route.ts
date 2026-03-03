import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProjectContext, isErrorResponse } from "@/lib/project-auth";

export async function GET(req: Request) {
  const ctx = await getProjectContext(req);
  if (isErrorResponse(ctx)) return ctx;

  const items = await prisma.sidebarItem.findMany({
    where: { projectId: ctx.projectId },
    orderBy: { order: "asc" },
    include: { children: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(items);
}
