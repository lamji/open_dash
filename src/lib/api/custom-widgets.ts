import type { CustomWidgetRecord, CustomWidgetsConfig } from "@/domain/dashboard/types";
import type { WidgetCategory } from "@/domain/widgets/types";

interface BuilderAiWidgetResponse {
  ok: boolean;
  widget?: {
    widgetId: string;
    category: WidgetCategory;
    title: string;
    widgetData: Record<string, unknown>;
  };
  error?: string;
}

function normalizeConfig(payload: unknown): CustomWidgetsConfig {
  if (
    payload &&
    typeof payload === "object" &&
    "widgets" in payload &&
    Array.isArray((payload as { widgets?: unknown[] }).widgets)
  ) {
    return {
      widgets: (payload as { widgets: CustomWidgetRecord[] }).widgets,
    };
  }

  return { widgets: [] };
}

export async function getCustomWidgets(projectId: string): Promise<CustomWidgetRecord[]> {
  console.log(`Debug flow: getCustomWidgets fired`, { projectId });
  const res = await fetch(`/api/config/custom_widgets?projectId=${projectId}`);

  if (!res.ok) {
    console.error(`Debug flow: getCustomWidgets failed`, { projectId, status: res.status });
    return [];
  }

  const data = (await res.json()) as unknown;
  return normalizeConfig(data).widgets;
}

export async function saveCustomWidgets(projectId: string, widgets: CustomWidgetRecord[]): Promise<boolean> {
  console.log(`Debug flow: saveCustomWidgets fired`, { projectId, count: widgets.length });
  const res = await fetch(`/api/config/custom_widgets?projectId=${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ widgets }),
  });

  return res.ok;
}

export async function generateAndStoreCustomWidget(
  projectId: string,
  prompt: string
): Promise<{ ok: boolean; widget?: CustomWidgetRecord; widgets?: CustomWidgetRecord[]; error?: string }> {
  console.log(`Debug flow: generateAndStoreCustomWidget fired`, { projectId, promptLength: prompt.length });
  const res = await fetch("/api/builder/ai-widget", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const generated = (await res.json()) as BuilderAiWidgetResponse;

  if (!generated.ok || !generated.widget) {
    return { ok: false, error: generated.error ?? "Failed to generate widget" };
  }

  const now = new Date().toISOString();
  const widget: CustomWidgetRecord = {
    id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `custom-${Date.now()}`,
    widgetId: generated.widget.widgetId,
    category: generated.widget.category,
    title: generated.widget.title,
    description: `Private custom widget generated from: ${prompt}`,
    widgetData: generated.widget.widgetData,
    prompt,
    createdAt: now,
  };

  const currentWidgets = await getCustomWidgets(projectId);
  const nextWidgets = [widget, ...currentWidgets].slice(0, 24);
  const saved = await saveCustomWidgets(projectId, nextWidgets);

  if (!saved) {
    return { ok: false, error: "Failed to save custom widget" };
  }

  return { ok: true, widget, widgets: nextWidgets };
}
