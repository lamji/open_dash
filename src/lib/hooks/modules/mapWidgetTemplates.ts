import type { WidgetTemplate } from "@/domain/widgets/types";

export function mapWidgetTemplates(
  widgets: (Omit<WidgetTemplate, "widgetData"> & { jsxCode?: string })[]
): WidgetTemplate[] {
  console.log(`Debug flow: mapWidgetTemplates fired with`, { count: widgets.length });
  return widgets.map((w) => ({
    ...w,
    widgetData: (() => {
      try { return JSON.parse(w.jsxCode ?? "{}"); } catch { return {}; }
    })(),
  }));
}
