import type { CSSProperties } from "react";
import type { LayoutBlock } from "@/domain/builder/types";
import {
  BLOCK_CSS_DRAFT_DEFAULT,
  COLUMN_CSS_DRAFT_DEFAULT,
  GRID_CLASS,
} from "./builder.constants";

export function cssStringToStyle(css: string): CSSProperties {
  console.log(`Debug flow: cssStringToStyle fired with`, { cssLen: css?.length });
  if (!css || !css.trim()) return {};
  const style: Record<string, string> = {};
  const normalized = css
    .replace(/,\s*\n\s*/g, "; ")
    .replace(/\n\s*/g, "; ")
    .replace(/\r/g, "");
  normalized.split(";").forEach((decl) => {
    const colonIdx = decl.indexOf(":");
    if (colonIdx === -1) return;
    const prop = decl.slice(0, colonIdx).trim();
    const val = decl.slice(colonIdx + 1).trim();
    if (!prop || !val) return;
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[camel] = val;
  });
  console.log(`Debug flow: cssStringToStyle result`, { keys: Object.keys(style) });
  return style as CSSProperties;
}

export function getCssEditorSeed(isBlockLevel: boolean, css: string): string {
  console.log(`Debug flow: getCssEditorSeed fired with`, { isBlockLevel, cssLength: css.length });
  if (css.trim().length > 0) {
    return css;
  }
  return isBlockLevel ? BLOCK_CSS_DRAFT_DEFAULT : COLUMN_CSS_DRAFT_DEFAULT;
}

export function findBlock(blocks: LayoutBlock[], blockId: string): LayoutBlock | null {
  console.log(`Debug flow: findBlock fired with`, { blockId, blockCount: blocks.length });
  for (const block of blocks) {
    if (block.id === blockId) {
      return block;
    }
    for (const slot of block.slots) {
      const found = findBlock(slot.childBlocks ?? [], blockId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function getBlockContainerStyle(block: LayoutBlock): CSSProperties {
  console.log(`Debug flow: getBlockContainerStyle fired with`, { blockId: block.id, display: block.layoutDisplay, gap: block.gap });
  const gap = block.gap ? `${block.gap}` : undefined;
  if (block.layoutDisplay === "flex") {
    return {
      display: "flex",
      flexDirection: block.slots.length > 1 ? "row" : "column",
      gap,
      justifyContent: block.justifyContent,
      alignItems: block.alignItems,
    };
  }
  return {
    gap,
    justifyItems: block.justifyContent === "start" ? "start" : block.justifyContent === "end" ? "end" : undefined,
    alignItems: block.alignItems,
    ...(block.gridRatio ? { gridTemplateColumns: "repeat(12, minmax(0, 1fr))" } : {}),
  };
}

export function getBlockContainerClass(block: LayoutBlock): string {
  console.log(`Debug flow: getBlockContainerClass fired with`, { blockId: block.id, display: block.layoutDisplay });
  if (block.layoutDisplay === "flex") {
    return "flex";
  }
  return `grid ${block.gridRatio ? "" : GRID_CLASS[block.type] ?? "grid-cols-1"}`;
}
