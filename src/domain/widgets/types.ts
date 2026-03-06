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

export interface TableFeatureConfig {
  sorting?: boolean;
  filtering?: boolean;
  pagination?: boolean;
  columnVisibility?: boolean;
  columnResizing?: boolean;
  rowSelection?: boolean;
  expandableRows?: boolean;
}

export interface TableWidgetConfig {
  title?: string;
  rows?: Record<string, unknown>[];
  features?: TableFeatureConfig;
  pageSize?: number;
  expandableRowContent?: Record<string, unknown>;
}

// ─── Lead Management Types ────────────────────────────────────

export type LeadStatus = "Hot" | "Warm" | "Cold" | "Qualified" | "Lost" | "Converted";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
  status: LeadStatus;
  score: number;
  tags?: string[];
  lastContact?: string;
  conversationHistory?: string[];
  notes?: string;
  createdAt?: string;
}

export interface LeadScore {
  value: number;
  label: string;
  stars?: number;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: string;
  variant?: "default" | "destructive" | "outline";
}

export interface ExpandedLeadDetails {
  profile: Lead;
  conversationHistory: { date: string; message: string }[];
  notes: { date: string; content: string }[];
  interactions: number;
}

export interface LeadsTableConfig {
  title?: string;
  rows?: Lead[];
  features?: TableFeatureConfig & {
    expandableRows?: boolean;
    bulkActions?: boolean;
  };
  bulkActionsList?: BulkAction[];
  pageSize?: number;
}
