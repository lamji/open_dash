import type { DashboardLayoutRecord, LayoutBlock } from "@/domain/builder/types";
import type { WidgetTemplate } from "@/domain/widgets/types";

export interface GetWidgetsResponse {
  ok: boolean;
  widgets?: (Omit<WidgetTemplate, "widgetData"> & { jsxCode?: string })[];
  error?: string;
}

export async function getWidgets(): Promise<GetWidgetsResponse> {
  console.log(`Debug flow: getWidgets API call fired`);
  const res = await fetch("/api/widgets");
  const data = await res.json();
  console.log(`Debug flow: getWidgets API response`, { count: data.widgets?.length });
  return { ok: true, widgets: data.widgets ?? [] };
}

export interface SaveLayoutResponse {
  ok: boolean;
  layout?: DashboardLayoutRecord;
  error?: string;
}

export interface GetLayoutResponse {
  ok: boolean;
  layout?: DashboardLayoutRecord;
  error?: string;
}

export async function saveLayout(name: string, layout: LayoutBlock[]): Promise<SaveLayoutResponse> {
  console.log(`Debug flow: saveLayout API call fired`, { name, blockCount: layout.length });
  const res = await fetch("/api/builder/layouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, layout }),
  });
  const data = await res.json();
  console.log(`Debug flow: saveLayout API response`, { ok: data.ok, id: data.layout?.id });
  return data as SaveLayoutResponse;
}

export async function getLayout(id: string): Promise<GetLayoutResponse> {
  console.log(`Debug flow: getLayout API call fired`, { id });
  const res = await fetch(`/api/builder/layouts/${id}`);
  const data = await res.json();
  console.log(`Debug flow: getLayout API response`, { ok: data.ok, name: data.layout?.name });
  return data as GetLayoutResponse;
}
