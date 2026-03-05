export interface WidgetTemplate {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: WidgetCategory;
  jsxCode: string;
  widgetData?: Record<string, unknown>;
}

export type WidgetCategory =
  | "stats"
  | "charts"
  | "progress"
  | "activity"
  | "comparison"
  | "health"
  | "timeline"
  | "list"
  | "table"
  | "funnel"
  | "leaderboard"
  | "summary"
  | "button"
  | "dropdown"
  | "menu"
  | "search"
  | "form";

export interface WidgetCategoryInfo {
  id: WidgetCategory;
  label: string;
  color: string;
}
