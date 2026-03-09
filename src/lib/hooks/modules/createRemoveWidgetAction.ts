import type { Dispatch, SetStateAction } from "react";
import type { LayoutBlock } from "@/domain/builder/types";
import {
  createEmptySlot,
  normalizeBlocks,
  updateBlockInTree,
} from "./useBuilderController.helpers";

export function createRemoveWidgetAction({
  setBlocks,
}: {
  setBlocks: Dispatch<SetStateAction<LayoutBlock[]>>;
}) {
  return (blockId: string, slotIdx: number) => {
    console.log(`Debug flow: removeWidget fired with`, { blockId, slotIdx });
    setBlocks((prev) => {
      const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
        const newSlots = [...block.slots];
        const existingSlot = newSlots[slotIdx] ?? createEmptySlot();
        newSlots[slotIdx] = { ...existingSlot, widget: null };
        return { ...block, slots: newSlots };
      });
      return result.blocks;
    });
  };
}
