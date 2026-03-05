import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProjectContext, isErrorResponse } from "@/lib/project-auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log(`Debug flow: DELETE /api/sidebar/[id] fired with`, { id });

  const ctx = await getProjectContext(req);
  if (isErrorResponse(ctx)) return ctx;

  const { projectId } = ctx;

  try {
    // Verify the item belongs to this project before deleting
    const item = await prisma.sidebarItem.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!item) {
      return NextResponse.json({ ok: false, error: "Item not found" }, { status: 404 });
    }

    if (item.projectId !== projectId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
    }

    await prisma.sidebarItem.delete({
      where: { id },
    });

    console.log(`Debug flow: DELETE /api/sidebar/[id] deleted`, { id, projectId });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`Debug flow: DELETE /api/sidebar/[id] error`, err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to delete sidebar item" },
      { status: 500 }
    );
  }
}
