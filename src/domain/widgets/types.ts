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

export interface TabBarTabItem {
  label: string;
  active?: boolean;
}

export interface TabBarWidgetProps {
  data: Record<string, unknown>;
}

export interface ToggleWidgetProps {
  data: Record<string, unknown>;
}

export interface SidebarNavItem {
  icon: string;
  label: string;
  active?: boolean;
  badge?: string;
}

export interface SidebarNavWidgetProps {
  data: Record<string, unknown>;
}

export interface SelectWidgetOption {
  value: string;
  label: string;
}

export interface SelectWidgetProps {
  data: Record<string, unknown>;
}

export interface OrdersTableWidgetProps {
  data: Record<string, unknown>;
  preview?: boolean;
}

export interface CustomersTableWidgetProps {
  data: Record<string, unknown>;
  preview?: boolean;
}

export interface TransactionsTableWidgetProps {
  data: Record<string, unknown>;
  preview?: boolean;
}

export interface OrderStatusObject {
  value: string;
  options?: unknown[];
}

export interface OrderRow {
  id: string;
  customer: string;
  amount: string;
  status: string | OrderStatusObject;
}

export interface CustomerRow {
  name: string;
  email: string;
  plan: string;
  spend: string;
}

export interface TxRow {
  date: string;
  desc: string;
  amount: string;
  type: string;
}

export interface SortableHeaderContext {
  column: {
    id: string;
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
}

export interface SelectableRowState<TRow> {
  id: string;
  original: TRow;
  getIsSelected: () => boolean;
  toggleSelected: (value?: boolean) => void;
}

export interface OrdersTableCellContext {
  getValue: () => unknown;
  row: SelectableRowState<OrderRow>;
}

export interface CustomersTableCellContext {
  getValue: () => unknown;
  row: SelectableRowState<CustomerRow>;
}

export interface TransactionsTableCellContext {
  getValue: () => unknown;
  row: SelectableRowState<TxRow>;
}

export interface OrdersTableColumnHelpers {
  sorting: {
    value: Array<{ id: string; desc: boolean }>;
    set: (next: Array<{ id: string; desc: boolean }>) => void;
  };
  filtering: {
    value: Record<string, string>;
    clear: () => void;
    set: (id: string, value: string) => void;
  };
  rowSelection: {
    value: Record<string, boolean>;
    clear: () => void;
    toggle: (id: string) => void;
    set: (next: Record<string, boolean>) => void;
    selectAll: (ids: string[]) => void;
  };
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
