import type { NavItem } from "@/domain/builder/types";
import type { WidgetTemplate } from "@/domain/widgets/types";
import { getWidgets } from "@/lib/api/builder-layouts";
import { getNavItems } from "@/lib/api/builder-nav";
import { getCustomWidgets } from "@/lib/api/custom-widgets";
import { mapCustomWidgetTemplates } from "@/lib/hooks/modules/mapCustomWidgetTemplates";
import { mapWidgetTemplates } from "@/lib/hooks/modules/mapWidgetTemplates";

export async function loadBuilderNavItems(projectId: string): Promise<NavItem[]> {
  console.log(`Debug flow: loadBuilderNavItems fired`, { projectId });
  const data = await getNavItems(projectId);
  if (!data.ok || !data.items) {
    throw new Error(data.error ?? "Failed to load nav items");
  }
  return data.items;
}

export async function loadBuilderWidgetTemplates(): Promise<WidgetTemplate[]> {
  console.log(`Debug flow: loadBuilderWidgetTemplates fired`);
  const data = await getWidgets();
  return mapWidgetTemplates(data.widgets ?? []);
}

export async function loadBuilderCustomWidgetTemplates(projectId: string): Promise<WidgetTemplate[]> {
  console.log(`Debug flow: loadBuilderCustomWidgetTemplates fired`, { projectId });
  const widgets = await getCustomWidgets(projectId);
  return mapCustomWidgetTemplates(widgets);
}
