import type { Dispatch, SetStateAction } from "react";
import type { LayoutBlock } from "@/domain/builder/types";
import type { DashboardTemplate } from "@/lib/dashboard-templates";
import {
  createBlock,
  normalizeBlocks,
  TEMPLATE_BLOCK_MAP,
} from "./useBuilderController.helpers";

export function createApplyTemplateAction({
  buildLog,
  setBlocks,
  setShowLayoutPicker,
}: {
  buildLog: (message: string, metadata?: Record<string, unknown>) => void;
  setBlocks: Dispatch<SetStateAction<LayoutBlock[]>>;
  setShowLayoutPicker: Dispatch<SetStateAction<boolean>>;
}) {
  return (template: DashboardTemplate) => {
    buildLog("applyTemplate:ENTER", { templateId: template.id, templateName: template.name });

    const blockDefs = TEMPLATE_BLOCK_MAP[template.id];
    buildLog("applyTemplate:TEMPLATE_BLOCK_MAP_LOOKUP", {
      templateId: template.id,
      found: !!blockDefs,
      blockDefCount: blockDefs?.length ?? 0,
    });

    if (!blockDefs || blockDefs.length === 0) {
      buildLog("applyTemplate:NO_BLOCK_DEFS_FOUND", { templateId: template.id });
      return;
    }

    blockDefs.forEach((def, defIdx) => {
      buildLog(`applyTemplate:BLOCK_DEF[${defIdx}]`, {
        type: def.type,
        slotCount: def.slots.length,
        slots: def.slots.map((s, si) => ({
          slotIdx: si,
          isNull: s === null,
          widgetId: s?.widgetId ?? null,
          category: s?.category ?? null,
          title: s?.title ?? null,
          hasWidgetData: s?.widgetData ? Object.keys(s.widgetData).length > 0 : false,
        })),
      });
    });

    const newBlocks: LayoutBlock[] = blockDefs.map((def) => createBlock(def.type));

    buildLog("applyTemplate:NEW_BLOCKS_CREATED", {
      templateId: template.id,
      blocksCreated: newBlocks.length,
      blockSummary: newBlocks.map((b) => ({
        id: b.id,
        type: b.type,
        slotCount: b.slots.length,
        populatedSlots: b.slots.filter((s) => s.widget !== null).length,
        emptySlots: b.slots.filter((s) => s.widget === null && (s.childBlocks?.length ?? 0) === 0).length,
      })),
    });

    setBlocks((prev) => {
      const result = [...normalizeBlocks(prev), ...newBlocks];
      buildLog("applyTemplate:SET_BLOCKS", {
        prevBlockCount: prev.length,
        newBlockCount: newBlocks.length,
        totalBlockCount: result.length,
      });
      return result;
    });
    setShowLayoutPicker(false);

    buildLog("applyTemplate:EXIT", { templateId: template.id, blocksCreated: newBlocks.length });
  };
}
