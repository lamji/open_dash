import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProjectContext, isErrorResponse } from "@/lib/project-auth";

export async function GET(req: Request) {
  const ctx = await getProjectContext(req);
  if (isErrorResponse(ctx)) return ctx;

  const components = await prisma.headerComponent.findMany({
    where: { projectId: ctx.projectId },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(
    components.map((c) => ({
      id: c.id,
      type: c.type,
      position: c.position,
      config: JSON.parse(c.config),
    }))
  );
}
