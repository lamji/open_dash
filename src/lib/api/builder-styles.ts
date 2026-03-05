import type { GroqChatMessage } from "@/domain/builder/types";

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
  }
): Promise<GenerateAiStyleResponse> {
  console.log(`Debug flow: generateAiStyle fired with`, { blockId, slotIdx, blockType, message, widget });
  try {
    const res = await fetch("/api/builder/ai-style", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, slotIdx, blockType, currentCss, message, history, widget }),
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
  history: GroqChatMessage[]
): Promise<GenerateAiWidgetUpdateResponse> {
  console.log(`Debug flow: generateAiWidgetUpdate fired with`, { blockId, slotIdx, widgetId, category, message });
  try {
    const res = await fetch("/api/builder/ai-widget-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockId, slotIdx, currentWidgetData, widgetId, category, message, history }),
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
  widgetData: Record<string, unknown>,
  functionCode?: string,
  layoutId?: string
): Promise<SaveWidgetDataResponse> {
  console.log(`Debug flow: saveWidgetData fired with`, { blockId, slotIdx, dataKeys: Object.keys(widgetData), hasFunctionCode: !!functionCode, layoutId });
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
