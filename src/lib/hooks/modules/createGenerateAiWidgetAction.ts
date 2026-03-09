import type { Dispatch, SetStateAction } from "react";
import type { LayoutBlock, PlacedWidget } from "@/domain/builder/types";
import { generateAiWidgetRequest } from "@/lib/api/builder-runtime";
import {
  createEmptySlot,
  normalizeBlocks,
  updateBlockInTree,
} from "./useBuilderController.helpers";

export function createGenerateAiWidgetAction({
  buildPromptContext,
  setBlocks,
}: {
  buildPromptContext: (
    blockId: string,
    slotIdx: number,
    currentCss: string
  ) => { promptContext: string } | null;
  setBlocks: Dispatch<SetStateAction<LayoutBlock[]>>;
}) {
  return async (
    blockId: string,
    slotIdx: number,
    prompt: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const timestamp = new Date().toISOString();
    const logEntry = (msg: string, data?: unknown) => {
      const logLine = `[${timestamp}] useBuilder.generateAiWidget - ${msg}${data ? `: ${JSON.stringify(data)}` : ""}`;
      console.log(logLine);
    };

    const promptContextResult = buildPromptContext(blockId, slotIdx, "");
    logEntry("START", {
      blockId,
      slotIdx,
      prompt,
      hasPromptContext: !!promptContextResult?.promptContext,
      promptContextLength: promptContextResult?.promptContext.length ?? 0,
    });
    try {
      const data = await generateAiWidgetRequest(prompt, promptContextResult?.promptContext);
      logEntry("API Response received", { ok: data.ok, widgetId: data.widget?.widgetId, hasError: !!data.error });

      if (!data.ok || !data.widget) {
        logEntry("ERROR: Invalid response", { error: data.error });
        return { ok: false, error: data.error ?? "Failed to generate widget" };
      }

      const placed: PlacedWidget = {
        widgetId: data.widget.widgetId,
        category: data.widget.category,
        title: data.widget.title,
        widgetData: data.widget.widgetData,
      };

      logEntry("Widget created, updating state", {
        widgetId: placed.widgetId,
        category: placed.category,
        widgetDataKeys: Object.keys(placed.widgetData),
        widgetDataSample: JSON.stringify(placed.widgetData).substring(0, 200),
      });

      setBlocks((prev) => {
        const result = updateBlockInTree(normalizeBlocks(prev), blockId, (block) => {
          const newSlots = [...block.slots];
          const existingSlot = newSlots[slotIdx] ?? createEmptySlot();
          newSlots[slotIdx] = { ...existingSlot, widget: placed };
          return { ...block, slots: newSlots };
        });
        return result.blocks;
      });

      logEntry("SUCCESS: Widget placed in state", { blockId, slotIdx });
      return { ok: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      logEntry("EXCEPTION", { error: errorMsg, stack: err instanceof Error ? err.stack : "" });
      return { ok: false, error: errorMsg };
    }
  };
}
