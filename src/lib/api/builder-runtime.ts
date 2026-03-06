import type { WidgetCategory } from "@/domain/widgets/types";

export async function postBuilderLog(
  message: string,
  metadata: Record<string, unknown>
): Promise<void> {
  console.log(`Debug flow: postBuilderLog fired with`, { message, metadata });
  await fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level: "debug", category: "builder-trace", message, metadata }),
  });
}

export async function bootstrapSocketServer(): Promise<void> {
  console.log(`Debug flow: bootstrapSocketServer fired with`, {});
  await fetch("/api/socket/io");
}

export interface GenerateAiWidgetApiResponse {
  ok: boolean;
  widget?: {
    widgetId: string;
    category: WidgetCategory;
    title: string;
    widgetData: Record<string, unknown>;
  };
  error?: string;
}

export async function generateAiWidgetRequest(
  prompt: string
): Promise<GenerateAiWidgetApiResponse> {
  console.log(`Debug flow: generateAiWidgetRequest fired with`, { prompt });
  const res = await fetch("/api/builder/ai-widget", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = (await res.json()) as GenerateAiWidgetApiResponse;
  console.log(`Debug flow: generateAiWidgetRequest response`, {
    ok: data.ok,
    widgetId: data.widget?.widgetId,
    hasError: !!data.error,
  });
  return data;
}
