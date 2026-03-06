import { useCallback } from "react";
import type {
  BuilderPromptContextSnapshot,
  BuilderPromptWidgetContext,
  LayoutBlock,
  LayoutSlot,
  PlacedWidget,
} from "@/domain/builder/types";
import { findBlockInTree, normalizeBlocks } from "./useBuilderController.helpers";

const COMMON_LUCIDE_ICONS = [
  "Save",
  "ArrowUpRight",
  "ChevronDown",
  "Plus",
  "Upload",
  "Download",
  "FileText",
  "Search",
  "Settings",
  "Trash2",
  "Check",
  "X",
  "Bell",
  "Calendar",
  "Clock",
  "User",
  "Users",
  "LayoutDashboard",
  "BarChart3",
  "TrendingUp",
  "TrendingDown",
  "Star",
] as const;

interface BuilderPromptContextResult {
  snapshot: BuilderPromptContextSnapshot;
  promptContext: string;
}

function mapWidgetContext(widget: PlacedWidget, slotIdx: number): BuilderPromptWidgetContext {
  console.log(`Debug flow: mapWidgetContext fired with`, { slotIdx, widgetId: widget.widgetId, category: widget.category });
  return {
    slotIdx,
    widgetId: widget.widgetId,
    category: widget.category,
    title: widget.title,
    widgetData: widget.widgetData,
    functionCode: widget.functionCode,
  };
}

function collectNestedWidgetContexts(blocks: LayoutBlock[]): BuilderPromptWidgetContext[] {
  console.log(`Debug flow: collectNestedWidgetContexts fired with`, { blockCount: blocks.length });
  const contexts: BuilderPromptWidgetContext[] = [];
  for (const block of blocks) {
    block.slots.forEach((slot, slotIdx) => {
      if (slot.widget) {
        contexts.push(mapWidgetContext(slot.widget, slotIdx));
      }
      if (slot.childBlocks && slot.childBlocks.length > 0) {
        contexts.push(...collectNestedWidgetContexts(slot.childBlocks));
      }
    });
  }
  return contexts;
}

function collectSiblingWidgetContexts(slots: LayoutSlot[], targetSlotIdx: number): BuilderPromptWidgetContext[] {
  console.log(`Debug flow: collectSiblingWidgetContexts fired with`, { slotCount: slots.length, targetSlotIdx });
  const contexts: BuilderPromptWidgetContext[] = [];
  slots.forEach((slot, slotIdx) => {
    if (slotIdx === targetSlotIdx || !slot.widget) return;
    contexts.push(mapWidgetContext(slot.widget, slotIdx));
  });
  return contexts;
}

function buildPromptContextText(snapshot: BuilderPromptContextSnapshot): string {
  console.log(`Debug flow: buildPromptContextText fired with`, {
    blockId: snapshot.blockId,
    slotIdx: snapshot.slotIdx,
    hasTargetWidget: !!snapshot.targetWidget,
    siblingCount: snapshot.siblingWidgets.length,
    nestedCount: snapshot.nestedWidgets.length,
  });

  const payload = {
    target: {
      blockId: snapshot.blockId,
      blockType: snapshot.blockType,
      slotIdx: snapshot.slotIdx,
      scope: snapshot.isBlockLevel ? "block-wrapper" : "column-slot",
      currentCss: snapshot.currentCss || "(none)",
    },
    targetWidget: snapshot.targetWidget ?? null,
    siblingWidgetsInSameBlock: snapshot.siblingWidgets,
    nestedWidgetsInsideTargetColumn: snapshot.nestedWidgets,
    blockStyles: snapshot.blockStyles ?? "",
    columnStyles: snapshot.columnStyles ?? [],
    guidance: {
      buttonDataKeys: ["icon", "buttonBgColor", "buttonTextColor", "iconColor", "arrowBgColor"],
      iconRule: "When user asks to change icon, use ONLY a valid Lucide icon name; do not invent icon names.",
      iconPolicy: "If requested icon is not valid in Lucide, keep existing icon and suggest valid alternatives.",
      availableLucideIcons: snapshot.availableLucideIcons,
    },
  };

  const promptContext = [
    "BUILDER_PROMPT_CONTEXT_START",
    JSON.stringify(payload, null, 2),
    "BUILDER_PROMPT_CONTEXT_RULES:",
    "- Use this context as the source of truth for target scope and widget data.",
    "- Modify only the target block/column/widget unless the user explicitly asks broader changes.",
    "- For button icon requests, update widgetData.icon using valid Lucide icon names only.",
    "BUILDER_PROMPT_CONTEXT_END",
  ].join("\n");

  console.log(`Debug flow: buildPromptContextText result`, { length: promptContext.length });
  return promptContext;
}

export function useBuilderPromptContext(blocks: LayoutBlock[]) {
  const buildPromptContext = useCallback((blockId: string, slotIdx: number, currentCss: string): BuilderPromptContextResult | null => {
    console.log(`Debug flow: buildPromptContext fired with`, { blockId, slotIdx, currentCssLength: currentCss.length });
    const normalizedBlocks = normalizeBlocks(blocks);
    const block = findBlockInTree(normalizedBlocks, blockId);
    if (!block) {
      console.warn(`Debug flow: buildPromptContext missing block`, { blockId, slotIdx });
      return null;
    }

    const isBlockLevel = slotIdx < 0;
    const targetSlot = !isBlockLevel ? block.slots[slotIdx] ?? null : null;
    const targetWidget = targetSlot?.widget ? mapWidgetContext(targetSlot.widget, slotIdx) : undefined;
    const siblingWidgets = isBlockLevel
      ? collectSiblingWidgetContexts(block.slots, Number.MIN_SAFE_INTEGER)
      : collectSiblingWidgetContexts(block.slots, slotIdx);
    const nestedWidgets = isBlockLevel
      ? collectNestedWidgetContexts(block.slots.flatMap((slot) => slot.childBlocks ?? []))
      : collectNestedWidgetContexts(targetSlot?.childBlocks ?? []);

    const snapshot: BuilderPromptContextSnapshot = {
      blockId,
      blockType: block.type,
      slotIdx,
      isBlockLevel,
      currentCss,
      blockStyles: block.blockStyles,
      columnStyles: block.columnStyles,
      targetWidget,
      siblingWidgets,
      nestedWidgets,
      availableLucideIcons: [...COMMON_LUCIDE_ICONS],
    };

    const promptContext = buildPromptContextText(snapshot);
    console.log(`Debug flow: buildPromptContext result`, {
      blockId,
      slotIdx,
      hasTargetWidget: !!snapshot.targetWidget,
      siblingCount: siblingWidgets.length,
      nestedCount: nestedWidgets.length,
      promptContextLength: promptContext.length,
    });
    return { snapshot, promptContext };
  }, [blocks]);

  return { buildPromptContext };
}
