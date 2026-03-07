import { useCallback } from "react";
import type {
  BuilderPromptContextSnapshot,
  BuilderPromptWidgetContext,
  LayoutBlock,
  LayoutSlot,
  PlacedWidget,
} from "@/domain/builder/types";
import { buildWidgetSpecPrompt, getWidgetSpec } from "@/lib/widget-spec-registry";
import { findBlockInTree, normalizeBlocks } from "./useBuilderController.helpers";

interface BuilderPromptContextResult {
  snapshot: BuilderPromptContextSnapshot;
  promptContext: string;
}

function mapWidgetContext(
  widget: PlacedWidget,
  slotIdx: number,
  slotCss?: string,
  blockCss?: string
): BuilderPromptWidgetContext {
  console.log(`Debug flow: mapWidgetContext fired with`, { slotIdx, widgetId: widget.widgetId, category: widget.category });
  const spec = getWidgetSpec(widget.widgetId, widget.category, widget.widgetData ?? {});
  const widgetDataKeys = Object.keys(widget.widgetData ?? {});
  return {
    slotIdx,
    widgetId: widget.widgetId,
    category: widget.category,
    title: widget.title,
    widgetData: widget.widgetData,
    functionCode: widget.functionCode,
    slotCss,
    blockCss,
    widgetDataKeys,
    widgetDataPaths: spec.dataFieldPaths,
    configFieldPaths: spec.configFieldPaths,
    iconFieldPaths: spec.iconFieldPaths,
    iconCandidates: spec.allowedLucideIcons,
  };
}

function collectNestedWidgetContexts(blocks: LayoutBlock[]): BuilderPromptWidgetContext[] {
  console.log(`Debug flow: collectNestedWidgetContexts fired with`, { blockCount: blocks.length });
  const contexts: BuilderPromptWidgetContext[] = [];
  for (const block of blocks) {
    block.slots.forEach((slot, slotIdx) => {
      if (slot.widget) {
        contexts.push(
          mapWidgetContext(
            slot.widget,
            slotIdx,
            block.columnStyles?.[slotIdx] ?? "",
            block.blockStyles ?? ""
          )
        );
      }
      if (slot.childBlocks && slot.childBlocks.length > 0) {
        contexts.push(...collectNestedWidgetContexts(slot.childBlocks));
      }
    });
  }
  return contexts;
}

function collectSiblingWidgetContexts(
  slots: LayoutSlot[],
  targetSlotIdx: number,
  columnStyles?: string[],
  blockStyles?: string
): BuilderPromptWidgetContext[] {
  console.log(`Debug flow: collectSiblingWidgetContexts fired with`, { slotCount: slots.length, targetSlotIdx });
  const contexts: BuilderPromptWidgetContext[] = [];
  slots.forEach((slot, slotIdx) => {
    if (slotIdx === targetSlotIdx || !slot.widget) return;
    contexts.push(mapWidgetContext(slot.widget, slotIdx, columnStyles?.[slotIdx] ?? "", blockStyles ?? ""));
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
      widgetContractMandatory: "All AI answers must follow the selected widget contract. Do not guess missing widget internals.",
      iconRule: "When user asks to change icon, use ONLY a valid Lucide icon name allowed by the widget contract.",
      iconPolicy: "If requested icon is not valid in Lucide, keep the existing icon and suggest valid alternatives from the contract.",
      availableLucideIcons: snapshot.availableLucideIcons,
      commandRouting: {
        styles: "Use /styles for container CSS only (layout/background/spacing).",
        data: "Use /data to update existing widgetData fields (labels, values, colors, icon).",
        config: "Use /config for structural/features configuration (table features/options/columns/settings).",
      },
    },
  };

  const promptContext = [
    "BUILDER_PROMPT_CONTEXT_START",
    JSON.stringify(payload, null, 2),
    snapshot.targetWidget
      ? buildWidgetSpecPrompt(getWidgetSpec(snapshot.targetWidget.widgetId, snapshot.targetWidget.category, snapshot.targetWidget.widgetData))
      : "WIDGET_SPEC_CONTRACT_START\nNo selected widget. Use /styles only.\nWIDGET_SPEC_CONTRACT_END",
    "BUILDER_PROMPT_CONTEXT_RULES:",
    "- Use this context and widget contract as the source of truth for target scope and widget data.",
    "- Modify only the target block/column/widget unless the user explicitly asks broader changes.",
    "- For internal widget changes (value, labels, icon, progress colors), use /data only when the field exists in the widget contract.",
    "- For table/options/features settings, use /config only when the field exists in the widget contract.",
    "- For container/background/spacing/alignment, use /styles with standard CSS declarations only.",
    "- If the requested change is outside the selected widget contract, say so instead of inventing fields or commands.",
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
    const targetWidget = targetSlot?.widget
      ? mapWidgetContext(
          targetSlot.widget,
          slotIdx,
          block.columnStyles?.[slotIdx] ?? "",
          block.blockStyles ?? ""
        )
      : undefined;
    const siblingWidgets = isBlockLevel
      ? collectSiblingWidgetContexts(block.slots, Number.MIN_SAFE_INTEGER, block.columnStyles, block.blockStyles)
      : collectSiblingWidgetContexts(block.slots, slotIdx, block.columnStyles, block.blockStyles);
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
      availableLucideIcons: targetWidget?.iconCandidates ?? [],
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
