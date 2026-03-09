import type { Dispatch, SetStateAction } from "react";
import type { LayoutBlock } from "@/domain/builder/types";
import {
  createEmptySlot,
  normalizeBlocks,
  updateBlockInTree,
} from "./useBuilderController.helpers";

export function createClearSlotContentAction({
  setBlocks,
}: {
  setBlocks: Dispatch<SetStateAction<LayoutBlock[]>>;
}) {
  return (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: clearSlotContent fired with`, { blockId, slotIdx });
    setBlocks((prev) => {
      const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
        const nextSlots = [...block.slots];
        nextSlots[slotIdx] = createEmptySlot();
        return { ...block, slots: nextSlots };
      });
      return result.blocks;
    });
  };
}
