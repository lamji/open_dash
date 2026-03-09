import type { Dispatch, SetStateAction } from "react";
import type { LayoutBlock, PlacedWidget, WidgetVariantPicker } from "@/domain/builder/types";
import type { WidgetTemplate } from "@/domain/widgets/types";
import {
  createEmptySlot,
  normalizeBlocks,
  updateBlockInTree,
} from "./useBuilderController.helpers";

export function createPlaceWidgetAction({
  setBlocks,
  setShowWidgetVariantPicker,
}: {
  setBlocks: Dispatch<SetStateAction<LayoutBlock[]>>;
  setShowWidgetVariantPicker: Dispatch<SetStateAction<WidgetVariantPicker | null>>;
}) {
  return (blockId: string, slotIdx: number, template: WidgetTemplate) => {
    console.log(`Debug flow: placeWidget fired with`, { blockId, slotIdx, slug: template.slug });
    const placed: PlacedWidget = {
      widgetId: template.runtimeWidgetId ?? template.slug,
      category: template.category,
      title: template.title,
      widgetData: template.widgetData ?? {},
    };
    setBlocks((prev) => {
      const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
        const newSlots = [...block.slots];
        const existingSlot = newSlots[slotIdx] ?? createEmptySlot();
        newSlots[slotIdx] = { ...existingSlot, widget: placed };
        return { ...block, slots: newSlots };
      });
      return result.blocks;
    });
    setShowWidgetVariantPicker(null);
  };
}
