import type { CSSProperties } from "react";
import type { LayoutBlock } from "@/domain/builder/types";
import {
  BLOCK_CSS_DRAFT_DEFAULT,
  COLUMN_CSS_DRAFT_DEFAULT,
  GRID_CLASS,
} from "./builder.constants";

const WIDGET_ELEMENT_OVERRIDE_PROPS = new Set([
  "color",
  "background",
  "background-color",
  "fill",
  "stroke",
]);

type WidgetOverrideTokens = {
  background?: string;
  backgroundColor?: string;
  color?: string;
  fill?: string;
  stroke?: string;
};

function normalizeBareHexValue(prop: string, val: string): string {
  console.log(`Debug flow: normalizeBareHexValue fired with`, { prop, val });
  if (!WIDGET_ELEMENT_OVERRIDE_PROPS.has(prop)) {
    return val;
  }
  const trimmed = val.trim();
  if (trimmed.startsWith("#")) {
    return trimmed;
  }
  const bareHexMatch = trimmed.match(/^([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/);
  const result = bareHexMatch ? `#${bareHexMatch[1]}` : trimmed;
  console.log(`Debug flow: normalizeBareHexValue result`, { result });
  return result;
}

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
  if (style.background !== undefined && style.backgroundColor !== undefined) {
    delete style.backgroundColor;
  }
  console.log(`Debug flow: cssStringToStyle result`, { keys: Object.keys(style) });
  return style as CSSProperties;
}

function normalizeCssDeclarations(css: string): Array<{ prop: string; value: string }> {
  console.log(`Debug flow: normalizeCssDeclarations fired with`, { cssLength: css.length });
  if (!css || !css.trim()) {
    return [];
  }
  const normalized = css
    .replace(/,\s*\n\s*/g, "; ")
    .replace(/\n\s*/g, "; ")
    .replace(/\r/g, "");
  const declarations: Array<{ prop: string; value: string }> = [];
  normalized.split(";").forEach((decl) => {
    const colonIdx = decl.indexOf(":");
    if (colonIdx === -1) return;
    const prop = decl.slice(0, colonIdx).trim().toLowerCase();
    const rawVal = decl.slice(colonIdx + 1).trim();
    if (!prop || !rawVal) return;
    if (rawVal.includes("{") || rawVal.includes("}")) return;
    declarations.push({
      prop,
      value: normalizeBareHexValue(prop, rawVal),
    });
  });
  console.log(`Debug flow: normalizeCssDeclarations result`, { declarationCount: declarations.length });
  return declarations;
}

function extractWidgetOverrideTokens(css: string): WidgetOverrideTokens {
  console.log(`Debug flow: extractWidgetOverrideTokens fired with`, { cssLength: css.length });
  const tokens: WidgetOverrideTokens = {};
  const declarations = normalizeCssDeclarations(css);
  declarations.forEach(({ prop, value }) => {
    if (!WIDGET_ELEMENT_OVERRIDE_PROPS.has(prop)) return;
    if (prop === "background") {
      tokens.background = value;
      return;
    }
    if (prop === "background-color") {
      tokens.backgroundColor = value;
      return;
    }
    if (prop === "color") {
      tokens.color = value;
      return;
    }
    if (prop === "fill") {
      tokens.fill = value;
      return;
    }
    if (prop === "stroke") {
      tokens.stroke = value;
    }
  });
  console.log(`Debug flow: extractWidgetOverrideTokens result`, { tokens });
  return tokens;
}

export function buildWidgetElementOverrideCss(css: string): string {
  console.log(`Debug flow: buildWidgetElementOverrideCss fired with`, { cssLength: css.length });
  const declarationsInput = normalizeCssDeclarations(css);
  const declarations: string[] = [];
  declarationsInput.forEach(({ prop, value }) => {
    if (!WIDGET_ELEMENT_OVERRIDE_PROPS.has(prop)) return;
    declarations.push(`${prop}: ${value} !important`);
  });
  const result = declarations.join("; ");
  console.log(`Debug flow: buildWidgetElementOverrideCss result`, {
    declarationCount: declarations.length,
    resultLength: result.length,
  });
  return result;
}

export function buildWidgetThemeOverrideCss(css: string, widgetStyleScope: string): string {
  console.log(`Debug flow: buildWidgetThemeOverrideCss fired with`, {
    cssLength: css.length,
    widgetStyleScope,
  });
  const tokens = extractWidgetOverrideTokens(css);
  const backgroundToken = tokens.backgroundColor ?? tokens.background;
  const textToken = tokens.color;
  const iconToken = tokens.color ?? tokens.stroke ?? tokens.fill;
  // Keep widget container background independent from progress visuals.
  const progressTrackToken = tokens.fill ?? tokens.stroke;
  const progressFillToken = textToken ?? tokens.fill ?? tokens.stroke;
  const scopeSelector = `[data-test-id="${widgetStyleScope}"]`;
  const cssRules: string[] = [];

  if (progressTrackToken) {
    cssRules.push(
      `${scopeSelector} [data-slot="progress"] { background-color: ${progressTrackToken} !important; }`
    );
  }
  if (progressFillToken) {
    cssRules.push(
      `${scopeSelector} [data-slot="progress-indicator"] { background-color: ${progressFillToken} !important; }`
    );
  }
  if (iconToken) {
    cssRules.push(
      `${scopeSelector} svg { color: ${iconToken} !important; stroke: currentColor !important; }`
    );
  }

  const result = cssRules.join(" ");
  console.log(`Debug flow: buildWidgetThemeOverrideCss result`, {
    hasBackgroundToken: !!backgroundToken,
    hasTextToken: !!textToken,
    hasIconToken: !!iconToken,
    ruleCount: cssRules.length,
    resultLength: result.length,
  });
  return result;
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

function parseGridRatioTracks(block: LayoutBlock): number[] {
  console.log(`Debug flow: builder parseGridRatioTracks fired with`, { blockId: block.id, gridRatio: block.gridRatio });
  if (!block.gridRatio) return [];
  const parts = block.gridRatio
    .split(" ")
    .map((part) => Number.parseFloat(part.trim().replace("fr", "")))
    .filter((part) => Number.isFinite(part) && part > 0);
  if (parts.length <= block.slots.length) {
    return parts;
  }
  return [...parts.slice(0, Math.max(block.slots.length - 1, 0)), parts[parts.length - 1]];
}

function getGridTrackScale(trackValues: number[]): number {
  console.log(`Debug flow: builder getGridTrackScale fired with`, { trackCount: trackValues.length });
  const maxDecimals = trackValues.reduce((highestValue, trackValue) => {
    const [, decimals = ""] = trackValue.toString().split(".");
    return Math.max(highestValue, decimals.length);
  }, 0);
  return 10 ** maxDecimals;
}

function getGridCanvasColumns(block: LayoutBlock): number | null {
  console.log(`Debug flow: builder getGridCanvasColumns fired with`, { blockId: block.id, slotCount: block.slots.length });
  const tracks = parseGridRatioTracks(block);
  if (!block.gridRatio || block.layoutDisplay !== "grid" || tracks.length !== block.slots.length) {
    return null;
  }
  const scale = getGridTrackScale(tracks);
  const totalTrackColumns = tracks.reduce((sum, trackValue) => sum + Math.round(trackValue * scale), 0);
  return Math.max(12 * scale, totalTrackColumns);
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
  const gridCanvasColumns = getGridCanvasColumns(block);
  return {
    gap,
    justifyItems:
      block.justifyContent === "start"
        ? "start"
        : block.justifyContent === "end"
          ? "end"
          : block.justifyContent === "center"
            ? "center"
            : undefined,
    alignItems: block.alignItems,
    ...(gridCanvasColumns ? { gridTemplateColumns: `repeat(${gridCanvasColumns}, minmax(0, 1fr))` } : {}),
  };
}

export function getBlockContainerClass(block: LayoutBlock): string {
  console.log(`Debug flow: getBlockContainerClass fired with`, { blockId: block.id, display: block.layoutDisplay });
  if (block.layoutDisplay === "flex") {
    return "flex";
  }
  return `grid ${block.gridRatio ? "" : GRID_CLASS[block.type] ?? "grid-cols-1"}`;
}
