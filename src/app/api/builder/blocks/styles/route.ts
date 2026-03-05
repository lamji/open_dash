import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import type { LayoutBlock } from "@/domain/builder/types";

async function getAuthenticatedUserId(): Promise<string | null> {
  console.log(`Debug flow: getAuthenticatedUserId (blocks/styles) fired`);
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const result = await validateSession(token);
  return result?.user?.id ?? null;
}

export async function PATCH(request: NextRequest) {
  console.log(`Debug flow: PATCH /api/builder/blocks/styles fired`);

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { blockId, slotIdx, css, layoutId, blocks } = body as {
      blockId: string;
      slotIdx: number;
      css: string;
      layoutId?: string;
      blocks?: LayoutBlock[];
    };

    if (!blockId || typeof slotIdx !== "number") {
      return NextResponse.json(
        { ok: false, error: "blockId and slotIdx are required" },
        { status: 400 }
      );
    }

    console.log(`Debug flow: PATCH /api/builder/blocks/styles params`, { blockId, slotIdx, layoutId, hasBlocks: !!blocks });

    let finalLayoutId = layoutId;
    let layout: LayoutBlock[] = [];

    if (layoutId) {
      const record = await prisma.dashboardLayout.findUnique({ where: { id: layoutId } });
      if (!record) {
        return NextResponse.json({ ok: false, error: "Layout not found" }, { status: 404 });
      }

      try {
        layout = JSON.parse(record.layout) as LayoutBlock[];
      } catch {
        return NextResponse.json({ ok: false, error: "Invalid layout JSON" }, { status: 500 });
      }
    } else if (blocks && blocks.length > 0) {
      console.log(`Debug flow: PATCH /api/builder/blocks/styles creating draft layout`, { blockCount: blocks.length });
      layout = blocks;
      const draftRecord = await prisma.dashboardLayout.create({
        data: {
          name: "Draft Layout",
          layout: JSON.stringify(layout),
        },
      });
      finalLayoutId = draftRecord.id;
      console.log(`Debug flow: PATCH /api/builder/blocks/styles draft created`, { layoutId: finalLayoutId });
    } else {
      return NextResponse.json(
        { ok: false, error: "Either layoutId or blocks array is required" },
        { status: 400 }
      );
    }

    const blockIdx = layout.findIndex((b) => b.id === blockId);
    if (blockIdx === -1) {
      return NextResponse.json({ ok: false, error: "Block not found in layout" }, { status: 404 });
    }

    const block = layout[blockIdx];
    const styles = block.columnStyles ? [...block.columnStyles] : Array.from({ length: block.slots.length }, () => "");

    while (styles.length <= slotIdx) styles.push("");
    styles[slotIdx] = css;

    layout[blockIdx] = { ...block, columnStyles: styles };

    await prisma.dashboardLayout.update({
      where: { id: finalLayoutId },
      data: { layout: JSON.stringify(layout) },
    });

    console.log(`Debug flow: PATCH /api/builder/blocks/styles updated layout`, { layoutId: finalLayoutId, blockId, slotIdx });

    return NextResponse.json({ ok: true, layoutId: finalLayoutId });
  } catch (err) {
    console.error(`Debug flow: PATCH /api/builder/blocks/styles error`, err);
    return NextResponse.json({ ok: false, error: "Failed to save styles" }, { status: 500 });
  }
}
