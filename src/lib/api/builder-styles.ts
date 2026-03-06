import type { GroqChatMessage, LayoutBlock } from "@/domain/builder/types";

export interface SaveWidgetDataResponse {
  ok: boolean;
  error?: string;
}

export interface SaveBlockStylesResponse {
  ok: boolean;
  layoutId?: string;
  error?: string;
}

export interface GenerateAiStyleResponse {
  ok: boolean;
  css?: string;
  error?: string;
}

export interface GenerateAiWidgetUpdateResponse {
  ok: boolean;
  widgetData?: Record<string, unknown>;
  error?: string;
}

export async function saveBlockStyles(
  blockId: string,
  slotIdx: number,
  css: string,
  layoutId?: string,
  blocks?: unknown[]
): Promise<SaveBlockStylesResponse> {
  console.log(`Debug flow: saveBlockStyles fired with`, { blockId, slotIdx, cssLength: css.length, layoutId, hasBlocks: !!blocks });
  try {
    const res = await fetch("/api/builder/blocks/styles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, slotIdx, css, layoutId, blocks }),
    });
    console.log(`Debug flow: saveBlockStyles http status`, { status: res.status, ok: res.ok });
    const text = await res.text();
    if (!text || !text.trim()) {
      console.warn(`Debug flow: saveBlockStyles empty response body`, { status: res.status });
      return { ok: res.ok };
    }
    const data = JSON.parse(text) as SaveBlockStylesResponse;
    console.log(`Debug flow: saveBlockStyles response`, { ok: data.ok, layoutId: data.layoutId });
    return data;
  } catch (err) {
    console.error(`Debug flow: saveBlockStyles error`, err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function generateAiStyle(
  blockId: string,
  slotIdx: number,
  blockType: string,
  currentCss: string,
  message: string,
  history: GroqChatMessage[],
  widget?: {
    widgetId: string;
    category: string;
    title: string;
    widgetData: Record<string, unknown>;
  },
  mode?: "styles"
): Promise<GenerateAiStyleResponse> {
  console.log(`Debug flow: generateAiStyle fired with`, { blockId, slotIdx, blockType, message, widget, mode });
  try {
    const res = await fetch("/api/builder/ai-style", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, slotIdx, blockType, currentCss, message, history, widget, mode }),
    });
    const data = await res.json();
    console.log(`Debug flow: generateAiStyle response`, { ok: data.ok, cssLength: data.css?.length });
    return data as GenerateAiStyleResponse;
  } catch (err) {
    console.error(`Debug flow: generateAiStyle error`, err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function generateAiWidgetUpdate(
  blockId: string,
  slotIdx: number,
  currentWidgetData: Record<string, unknown>,
  widgetId: string,
  category: string,
  message: string,
  history: GroqChatMessage[],
  mode?: "data" | "config"
): Promise<GenerateAiWidgetUpdateResponse> {
  console.log(`Debug flow: generateAiWidgetUpdate fired with`, { blockId, slotIdx, widgetId, category, message, mode });
  try {
    const res = await fetch("/api/builder/ai-widget-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, slotIdx, currentWidgetData, widgetId, category, message, history, mode }),
    });
    const data = await res.json();
    console.log(`Debug flow: generateAiWidgetUpdate response`, { ok: data.ok, hasWidgetData: !!data.widgetData });
    return data as GenerateAiWidgetUpdateResponse;
  } catch (err) {
    console.error(`Debug flow: generateAiWidgetUpdate error`, err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function saveWidgetData(
  blockId: string,
  slotIdx: number,
  widgetData?: Record<string, unknown>,
  functionCode?: string,
  layoutId?: string
): Promise<SaveWidgetDataResponse> {
  console.log(`Debug flow: saveWidgetData fired with`, {
    blockId,
    slotIdx,
    hasWidgetData: widgetData !== undefined,
    dataKeys: widgetData ? Object.keys(widgetData) : [],
    hasFunctionCode: functionCode !== undefined,
    layoutId,
  });
  try {
    const res = await fetch("/api/builder/blocks/data", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, slotIdx, widgetData, functionCode, layoutId }),
    });
    const data = await res.json();
    console.log(`Debug flow: saveWidgetData response`, { ok: data.ok });
    return data as SaveWidgetDataResponse;
  } catch (err) {
    console.error(`Debug flow: saveWidgetData error`, err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function saveGridRatio(
  blockId: string,
  ratio: string,
  layoutId?: string,
  blocks?: LayoutBlock[]
): Promise<SaveBlockStylesResponse> {
  console.log(`Debug flow: saveGridRatio fired with`, { blockId, ratio, layoutId, hasBlocks: !!blocks });
  try {
    const res = await fetch("/api/builder/blocks/styles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, slotIdx: -1, css: "", gridRatio: ratio, layoutId, blocks }),
    });
    const raw = await res.text();
    let data: Partial<SaveBlockStylesResponse> = {};
    if (raw.trim().length > 0) {
      try {
        data = JSON.parse(raw) as Partial<SaveBlockStylesResponse>;
      } catch (parseErr) {
        console.error(`Debug flow: saveGridRatio JSON parse error`, { parseErr, raw });
        return { ok: false, error: "Invalid JSON response from grid ratio save endpoint." };
      }
    } else if (!res.ok) {
      return { ok: false, error: `Grid ratio save failed with status ${res.status}.` };
    }
    console.log(`Debug flow: saveGridRatio response`, { ok: data.ok, layoutId: data.layoutId });
    if (typeof data.ok !== "boolean") {
      return res.ok
        ? { ok: true, layoutId }
        : { ok: false, error: `Grid ratio save failed with status ${res.status}.` };
    }
    return data as SaveBlockStylesResponse;
  } catch (err) {
    console.error(`Debug flow: saveGridRatio error`, err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
