import { NextResponse } from "next/server";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ProjectContext {
  userId: string;
  projectId: string;
}

export async function getProjectContext(
  req: Request
): Promise<ProjectContext | NextResponse> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const prefix = `${SESSION_COOKIE_NAME}=`;
  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(prefix))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await validateSession(token);
  if (!result) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "Missing projectId" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: result.user.id },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Project not found or access denied" },
      { status: 403 }
    );
  }

  return { userId: result.user.id, projectId };
}

export function isErrorResponse(
  result: ProjectContext | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
