import type { CustomWidgetRecord } from "@/domain/dashboard/types";
import type { WidgetTemplate } from "@/domain/widgets/types";

export function mapCustomWidgetTemplates(widgets: CustomWidgetRecord[]): WidgetTemplate[] {
  return widgets.map((widget) => ({
    id: widget.id,
    slug: `custom-${widget.id}`,
    runtimeWidgetId: widget.widgetId,
    title: widget.title,
    description: widget.description,
    category: widget.category,
    jsxCode: JSON.stringify(widget.widgetData ?? {}),
    widgetData: widget.widgetData,
  }));
}
