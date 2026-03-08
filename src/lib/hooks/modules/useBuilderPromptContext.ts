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

function formatJsxScalar(value: unknown): string {
  console.log(`Debug flow: formatJsxScalar fired with`, { valueType: typeof value, isArray: Array.isArray(value) });
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return `{${String(value)}}`;
  }
  if (value === null) {
    return "{null}";
  }
  return JSON.stringify(value);
}

function toPascalCase(value: string): string {
  console.log(`Debug flow: toPascalCase fired with`, { value });
  const segments = value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const result = segments.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join("") || "Widget";
  console.log(`Debug flow: toPascalCase result`, { result });
  return result;
}

function indentLines(value: string, depth: number): string {
  console.log(`Debug flow: indentLines fired with`, { depth, length: value.length });
  const padding = "  ".repeat(depth);
  return value
    .split("\n")
    .map((line) => `${padding}${line}`)
    .join("\n");
}

function serializePropsToJsx(props: Record<string, unknown>, depth: number): string[] {
  console.log(`Debug flow: serializePropsToJsx fired with`, { depth, propCount: Object.keys(props).length });
  return Object.entries(props).flatMap(([key, value]) => {
    if (value === undefined) {
      return [];
    }
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      return [`${key}=${formatJsxScalar(value)}`];
    }
    return [`${key}={${JSON.stringify(value, null, 2).replace(/\n/g, `\n${"  ".repeat(depth + 1)}`)}}`];
  });
}

function serializeWidgetToJsx(widget: PlacedWidget, depth = 0): string {
  console.log(`Debug flow: serializeWidgetToJsx fired with`, { depth, widgetId: widget.widgetId, category: widget.category });
  const componentName = `${toPascalCase(widget.widgetId)}Widget`;
  const propLines = serializePropsToJsx(
    {
      title: widget.title,
      widgetId: widget.widgetId,
      category: widget.category,
      ...widget.widgetData,
    },
    depth
  );
  if (propLines.length === 0) {
    return indentLines(`<${componentName} />`, depth);
  }
  return [
    indentLines(`<${componentName}`, depth),
    ...propLines.map((line) => indentLines(line, depth + 1)),
    indentLines("/>", depth),
  ].join("\n");
}

function serializeSlotToJsx(slot: LayoutSlot, slotIdx: number, depth = 0): string {
  console.log(`Debug flow: serializeSlotToJsx fired with`, {
    slotIdx,
    depth,
    hasWidget: !!slot.widget,
    childBlockCount: slot.childBlocks?.length ?? 0,
  });
  const children: string[] = [];
  if (slot.widget) {
    children.push(serializeWidgetToJsx(slot.widget, depth + 1));
  }
  (slot.childBlocks ?? []).forEach((childBlock) => {
    children.push(serializeBlockToJsx(childBlock, depth + 1));
  });
  if (children.length === 0) {
    children.push(indentLines("{/* empty slot */}", depth + 1));
  }
  return [
    indentLines(`<Column slotIndex={${slotIdx}}>` , depth),
    ...children,
    indentLines(`</Column>`, depth),
  ].join("\n");
}

function serializeBlockToJsx(block: LayoutBlock, depth = 0): string {
  console.log(`Debug flow: serializeBlockToJsx fired with`, { blockId: block.id, blockType: block.type, depth });
  const header = `<LayoutBlock id=${JSON.stringify(block.id)} type=${JSON.stringify(block.type)}>`;
  const children = block.slots.map((slot, slotIdx) => serializeSlotToJsx(slot, slotIdx, depth + 1));
  return [
    indentLines(header, depth),
    ...children,
    indentLines(`</LayoutBlock>`, depth),
  ].join("\n");
}

function buildSelectedScopeJsx(block: LayoutBlock, slotIdx: number, currentCss: string): string {
  console.log(`Debug flow: buildSelectedScopeJsx fired with`, { blockId: block.id, slotIdx, currentCssLength: currentCss.length });
  if (slotIdx < 0) {
    return [
      "import { LayoutBlock, Column } from '@/builder-ai-context'",
      "",
      "const SelectedBlockContext = () => (",
      serializeBlockToJsx(block, 1),
      ");",
      "",
      "export default SelectedBlockContext;",
    ].join("\n");
  }

  const selectedSlot = block.slots[slotIdx] ?? null;
  const columnStyle = block.columnStyles?.[slotIdx] ?? currentCss;
  const widgetImport = selectedSlot?.widget
    ? `import { ${toPascalCase(selectedSlot.widget.widgetId)}Widget } from '@/presentation/widgets'`
    : null;
  const children = selectedSlot ? serializeSlotToJsx(selectedSlot, slotIdx, 1) : indentLines("{/* missing slot */}", 1);
  return [
    "import { SelectedColumn, Column, LayoutBlock } from '@/builder-ai-context'",
    ...(widgetImport ? [widgetImport] : []),
    "",
    "const SelectedColumnContext = () => (",
    indentLines(
      `<SelectedColumn blockId=${JSON.stringify(block.id)} blockType=${JSON.stringify(block.type)} slotIndex={${slotIdx}} currentCss=${JSON.stringify(columnStyle)}>` ,
      1
    ),
    children,
    indentLines(`</SelectedColumn>`, 1),
    ");",
    "",
    "export default SelectedColumnContext;",
  ].join("\n");
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

function buildPromptContextText(snapshot: BuilderPromptContextSnapshot, block: LayoutBlock): string {
  console.log(`Debug flow: buildPromptContextText fired with`, {
    blockId: snapshot.blockId,
    slotIdx: snapshot.slotIdx,
    hasTargetWidget: !!snapshot.targetWidget,
    siblingCount: snapshot.siblingWidgets.length,
    nestedCount: snapshot.nestedWidgets.length,
    blockSlotCount: block.slots.length,
  });
  const jsxContext = buildSelectedScopeJsx(block, snapshot.slotIdx, snapshot.currentCss);
  const siblingSummary = snapshot.siblingWidgets.length > 0
    ? snapshot.siblingWidgets.map((widget) => `- slot ${widget.slotIdx}: ${widget.widgetId} (${widget.title})`).join("\n")
    : "- none";
  const nestedSummary = snapshot.nestedWidgets.length > 0
    ? snapshot.nestedWidgets.map((widget) => `- slot ${widget.slotIdx}: ${widget.widgetId} (${widget.title})`).join("\n")
    : "- none";

  const promptContext = [
    "BUILDER_PROMPT_CONTEXT_START",
    "TARGET_SCOPE",
    `- blockId: ${snapshot.blockId}`,
    `- blockType: ${snapshot.blockType}`,
    `- slotIdx: ${snapshot.slotIdx}`,
    `- scope: ${snapshot.isBlockLevel ? "block-wrapper" : "column-slot"}`,
    `- currentCss: ${snapshot.currentCss || "(none)"}`,
    "",
    "SELECTED_SCOPE_JSX_START",
    jsxContext,
    "SELECTED_SCOPE_JSX_END",
    "",
    "SIBLING_WIDGET_SUMMARY",
    siblingSummary,
    "",
    "NESTED_WIDGET_SUMMARY",
    nestedSummary,
    "",
    snapshot.targetWidget
      ? buildWidgetSpecPrompt(getWidgetSpec(snapshot.targetWidget.widgetId, snapshot.targetWidget.category, snapshot.targetWidget.widgetData))
      : "WIDGET_SPEC_CONTRACT_START\nNo selected widget. Use /styles only.\nWIDGET_SPEC_CONTRACT_END",
    "BUILDER_PROMPT_CONTEXT_RULES:",
    "- Use the JSX tree as the primary source of truth for structure and scope.",
    "- Use the widget contract as the secondary source of truth for allowed widget data/config fields.",
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

    const promptContext = buildPromptContextText(snapshot, block);
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
