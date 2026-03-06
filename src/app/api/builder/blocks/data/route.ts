import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { validateSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import type { LayoutBlock } from "@/domain/builder/types";

function updateBlockInTree(
  blocks: LayoutBlock[],
  blockId: string,
  updater: (block: LayoutBlock) => LayoutBlock
): { blocks: LayoutBlock[]; updated: boolean } {
  console.log(`Debug flow: updateBlockInTree (blocks/data) fired with`, { blockId, blockCount: blocks.length });
  let updated = false;
  const nextBlocks = blocks.map((block) => {
    if (block.id === blockId) {
      updated = true;
      return updater(block);
    }

    let childUpdated = false;
    const nextSlots = block.slots.map((slot) => {
      const childBlocks = slot.childBlocks ?? [];
      if (childBlocks.length === 0) {
        return slot;
      }
      const result = updateBlockInTree(childBlocks, blockId, updater);
      if (!result.updated) {
        return slot;
      }
      childUpdated = true;
      return { ...slot, childBlocks: result.blocks };
    });

    if (!childUpdated) {
      return block;
    }

    updated = true;
    return { ...block, slots: nextSlots };
  });

  return { blocks: updated ? nextBlocks : blocks, updated };
}

async function getAuthenticatedUserId(): Promise<string | null> {
  console.log(`Debug flow: getAuthenticatedUserId (blocks/data) fired`);
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const result = await validateSession(token);
  return result?.user?.id ?? null;
}

export async function PATCH(request: NextRequest) {
  console.log(`Debug flow: PATCH /api/builder/blocks/data fired`);

  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { blockId, slotIdx, widgetData, functionCode, layoutId } = body as {
      blockId: string;
      slotIdx: number;
      widgetData: Record<string, unknown>;
      functionCode?: string;
      layoutId?: string;
    };

    if (!blockId || typeof slotIdx !== "number") {
      return NextResponse.json(
        { ok: false, error: "blockId and slotIdx are required" },
        { status: 400 }
      );
    }

    console.log(`Debug flow: PATCH /api/builder/blocks/data params`, { blockId, slotIdx, layoutId, hasFunctionCode: !!functionCode });

    if (layoutId) {
      const record = await prisma.dashboardLayout.findUnique({ where: { id: layoutId } });
      if (!record) {
        return NextResponse.json({ ok: false, error: "Layout not found" }, { status: 404 });
      }

      let layout: LayoutBlock[] = [];
      try {
        layout = JSON.parse(record.layout) as LayoutBlock[];
      } catch {
        return NextResponse.json({ ok: false, error: "Invalid layout JSON" }, { status: 500 });
      }

      const result = updateBlockInTree(layout, blockId, (block) => {
        const newSlots = [...block.slots];
        const existingSlot = newSlots[slotIdx];

        if (existingSlot?.widget) {
          newSlots[slotIdx] = {
            ...existingSlot,
            widget: {
              ...existingSlot.widget,
              widgetData: widgetData ?? existingSlot.widget.widgetData,
              functionCode: functionCode !== undefined ? functionCode : existingSlot.widget.functionCode,
            },
          };
        }

        return { ...block, slots: newSlots };
      });

      if (!result.updated) {
        return NextResponse.json({ ok: false, error: "Block not found in layout" }, { status: 404 });
      }

      await prisma.dashboardLayout.update({
        where: { id: layoutId },
        data: { layout: JSON.stringify(result.blocks) },
      });

      console.log(`Debug flow: PATCH /api/builder/blocks/data updated layout`, { layoutId, blockId, slotIdx });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`Debug flow: PATCH /api/builder/blocks/data error`, err);
    return NextResponse.json({ ok: false, error: "Failed to save widget data" }, { status: 500 });
  }
}
