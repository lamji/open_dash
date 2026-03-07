"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
} from "recharts";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type Table,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Copy, Check, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  DollarSign, Users, Target, BarChart3, Activity, PieChart, Calendar,
  ShoppingCart, Clock, Zap, Star, Bell, AlertTriangle, Trophy,
  Filter, Award, LayoutDashboard, ChevronRight,
  Search, Plus, ChevronDown, ArrowUp, ArrowDown, ArrowUpDown, Eye, Upload,
  ChevronLeft, ChevronRight as ChevronRightIcon, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DynamicIcon } from "@/lib/component-registry";
import { useWidgets } from "./useWidgets";
import { useTableState } from "./useTableState";
import { CustomersTableWidget } from "./modules/CustomersTableWidget";
import { OrdersTableWidget } from "./modules/OrdersTableWidget";
import { SelectWidget } from "./modules/SelectWidget";
import { SidebarNavWidget } from "./modules/SidebarNavWidget";
import { TabBarWidget } from "./modules/TabBarWidget";
import { TransactionsTableWidget } from "./modules/TransactionsTableWidget";
import { ToggleWidget } from "./modules/ToggleWidget";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { WidgetCategoryInfo, WidgetCategory, Lead, LeadStatus, LeadsTableConfig } from "@/domain/widgets/types";
import type { WidgetTemplate } from "./useWidgets";

export const WIDGET_CATEGORIES: WidgetCategoryInfo[] = [
  { id: "stats",       label: "Stats & KPIs", color: "bg-blue-500" },
  { id: "charts",      label: "Charts",       color: "bg-violet-500" },
  { id: "progress",    label: "Progress",     color: "bg-emerald-500" },
  { id: "activity",    label: "Activity",     color: "bg-orange-500" },
  { id: "comparison",  label: "Comparison",   color: "bg-pink-500" },
  { id: "health",      label: "Health",       color: "bg-red-500" },
  { id: "timeline",    label: "Timeline",     color: "bg-indigo-500" },
  { id: "list",        label: "Lists",        color: "bg-teal-500" },
  { id: "table",       label: "Tables",       color: "bg-cyan-500" },
  { id: "funnel",      label: "Funnels",      color: "bg-amber-500" },
  { id: "leaderboard", label: "Leaderboard",  color: "bg-yellow-500" },
  { id: "summary",     label: "Summary",      color: "bg-slate-600" },
  { id: "button",      label: "Buttons",      color: "bg-rose-500" },
  { id: "dropdown",    label: "Dropdowns",    color: "bg-sky-500" },
  { id: "menu",        label: "Menus",        color: "bg-lime-600" },
  { id: "search",      label: "Search",       color: "bg-fuchsia-500" },
  { id: "form",        label: "Forms",        color: "bg-amber-600" },
];

export const CATEGORY_RING: Record<string, string> = {
  stats:       "ring-blue-200    bg-blue-50",
  charts:      "ring-violet-200  bg-violet-50",
  progress:    "ring-emerald-200 bg-emerald-50",
  activity:    "ring-orange-200  bg-orange-50",
  comparison:  "ring-pink-200    bg-pink-50",
  health:      "ring-red-200     bg-red-50",
  timeline:    "ring-indigo-200  bg-indigo-50",
  list:        "ring-teal-200    bg-teal-50",
  table:       "ring-cyan-200    bg-cyan-50",
  funnel:      "ring-amber-200   bg-amber-50",
  leaderboard: "ring-yellow-200  bg-yellow-50",
  summary:     "ring-slate-200   bg-slate-50",
  button:      "ring-rose-200    bg-rose-50",
  dropdown:    "ring-sky-200     bg-sky-50",
  menu:        "ring-lime-200    bg-lime-50",
  search:      "ring-fuchsia-200 bg-fuchsia-50",
  form:        "ring-amber-200   bg-amber-50",
};

function getCategoryLabel(category: string) {
  return WIDGET_CATEGORIES.find(c => c.id === category)?.label ?? category;
}
function getCategoryColor(category: string) {
  return WIDGET_CATEGORIES.find(c => c.id === category)?.color ?? "bg-slate-500";
}

/* ─── Stateful interactive widget components ────────────────── */

/* ─── Data-driven React previews — reads from DB widgetData ─── */
type PD = Record<string, unknown>;

function KpiCard({ data, iconEl }: { data: PD; iconEl: React.ReactElement }) {
  const v = (data.value as string) ?? "—";
  const label = (data.label as string) ?? "";
  const trend = (data.trend as string) ?? "";
  const up = (data.trendUp as boolean) ?? true;
  const period = (data.period as string) ?? "";
  const iconName = (data.icon as string | undefined) ?? null;
  const resolvedIcon = iconName ? <DynamicIcon name={iconName} className="w-5 h-5 text-slate-400" /> : iconEl;
  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between">{resolvedIcon}<span className="text-xs text-slate-400 font-medium">{period}</span></div>
      <div><p className="text-2xl font-bold text-slate-900">{v}</p><p className="text-xs text-slate-500 mt-0.5">{label}</p></div>
      {trend && (
        <div className={`flex items-center gap-1.5 ${up ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"} rounded-md px-2 py-1 w-fit`}>
          {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span className="text-xs font-semibold">{trend}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Enterprise LeadsTable Widget ────────────────────────────── */

type LeadRow = Lead;
type LeadHeaderContext = { column: { id: string; getIsSorted: () => false | "asc" | "desc"; toggleSorting: (desc?: boolean) => void } };
type LeadCellContext = { getValue: () => unknown; row: { id: string; original: LeadRow; getIsSelected: () => boolean; toggleSelected: (value?: boolean) => void } };

function LeadsTableWidget({ data, preview = false }: { data: Record<string, unknown>; preview?: boolean }) {
  "use no memo";
  const config = data as LeadsTableConfig;
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const allRows: LeadRow[] = (config.rows as LeadRow[]) ?? [
    {
      id: "L001",
      name: "Sarah Johnson",
      email: "sarah.johnson@acme.com",
      phone: "(555) 123-4567",
      company: "Acme Corp",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      status: "Hot" as LeadStatus,
      score: 95,
      tags: ["Enterprise", "Urgent"],
      lastContact: "2 hours ago",
      conversationHistory: ["Initial pitch sent", "Call scheduled"],
      notes: "Very interested in Q1 implementation",
    },
    {
      id: "L002",
      name: "Marcus Chen",
      email: "m.chen@techstartup.io",
      phone: "(555) 234-5678",
      company: "Tech Startup Inc",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      status: "Warm" as LeadStatus,
      score: 78,
      tags: ["Mid-Market", "Tech"],
      lastContact: "3 days ago",
      conversationHistory: ["Demo completed", "Awaiting approval"],
      notes: "Budget approval pending",
    },
    {
      id: "L003",
      name: "Emma Rodriguez",
      email: "emma.r@fintech.co",
      phone: "(555) 345-6789",
      company: "FinTech Solutions",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      status: "Qualified" as LeadStatus,
      score: 68,
      tags: ["Finance", "Compliance"],
      lastContact: "1 week ago",
      conversationHistory: ["Initial contact", "Needs assessment"],
      notes: "Interested but has compliance concerns",
    },
    {
      id: "L004",
      name: "James Wilson",
      email: "j.wilson@retailchain.com",
      phone: "(555) 456-7890",
      company: "Retail Chain Co",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
      status: "Cold" as LeadStatus,
      score: 35,
      tags: ["Retail", "SMB"],
      lastContact: "2 weeks ago",
      conversationHistory: ["First outreach", "No response"],
      notes: "May follow up in Q2",
    },
  ];

  // In preview mode, show only 2 rows and disable all interactive features
  const rows = preview ? allRows.slice(0, 2) : allRows;

  const features = preview
    ? {
        sorting: false,
        filtering: false,
        pagination: false,
        columnVisibility: false,
        columnResizing: false,
        rowSelection: false,
        expandableRows: false,
      }
    : (config.features ?? {
        sorting: true,
        filtering: true,
        pagination: true,
        columnVisibility: true,
        columnResizing: true,
        rowSelection: true,
        expandableRows: true,
      });

  const tableState = useTableState();

  const statusColors: Record<LeadStatus, string> = {
    Hot: "text-red-700 bg-red-50 border-l-2 border-red-500",
    Warm: "text-orange-700 bg-orange-50 border-l-2 border-orange-500",
    Qualified: "text-blue-700 bg-blue-50 border-l-2 border-blue-500",
    Cold: "text-slate-700 bg-slate-50 border-l-2 border-slate-300",
    Lost: "text-slate-600 bg-slate-100 border-l-2 border-slate-400",
    Converted: "text-emerald-700 bg-emerald-50 border-l-2 border-emerald-500",
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderLeadScore = (score: number): React.ReactElement => {
    const filledStars = Math.floor(score / 20);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={14} className={i <= filledStars ? "text-yellow-400 fill-yellow-400" : "text-slate-300"} />
        ))}
        <span className="text-xs font-semibold text-slate-700 ml-1">{score}</span>
      </div>
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`[DEBUG] LeadsTableWidget bulk action: ${action}`, {
      selectedRows: Object.keys(tableState.rowSelection),
      count: Object.keys(tableState.rowSelection).length,
    });
  };

  const columns: ColumnDef<LeadRow>[] = [
    ...(features.rowSelection
      ? [
          {
            id: "select",
            header: ({ table }: { table: Table<LeadRow> }) => (
              <input
                type="checkbox"
                checked={table.getIsAllRowsSelected()}
                onChange={(e) => {
                  table.toggleAllRowsSelected(e.target.checked);
                  if (e.target.checked) {
                    tableState.selectAllRows(table.getRowModel().rows.map((r) => r.id));
                  } else {
                    tableState.clearRowSelection();
                  }
                }}
                className="cursor-pointer"
                data-test-id="leads-table-select-all"
              />
            ),
            cell: ({ row }: { row: { id: string; getIsSelected: () => boolean; toggleSelected: (value?: boolean) => void } }) => (
              <input
                type="checkbox"
                checked={row.getIsSelected()}
                onChange={(e) => {
                  row.toggleSelected(e.target.checked);
                  tableState.toggleRowSelection(row.id);
                }}
                className="cursor-pointer"
                data-test-id={`leads-table-row-select-${row.id}`}
              />
            ),
            size: 40,
          },
        ]
      : []),
    ...(features.expandableRows
      ? [
          {
            id: "expand",
            cell: ({ row }: { row: { id: string } }) => (
              <button
                onClick={() => {
                  const newSet = new Set(expandedRows);
                  if (newSet.has(row.id)) {
                    newSet.delete(row.id);
                  } else {
                    newSet.add(row.id);
                  }
                  setExpandedRows(newSet);
                }}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                data-test-id={`leads-table-expand-${row.id}`}
              >
                <ChevronRight size={14} className={expandedRows.has(row.id) ? "rotate-90 transition-transform" : "transition-transform"} />
              </button>
            ),
            size: 40,
          },
        ]
      : []),
    {
      accessorKey: "name",
      header: features.sorting ? ({ column }: LeadHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="leads-table-sort-name"
        >
          Name
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Name",
      cell: ({ row }: LeadCellContext) => {
        const lead = row.original as LeadRow;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={lead.avatar} alt={lead.name} />
              <AvatarFallback className="text-xs font-semibold">{getInitials(lead.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-slate-900 text-xs">{lead.name}</span>
              <span className="text-xs text-slate-500">{lead.company}</span>
            </div>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: "email",
      header: features.sorting ? ({ column }: LeadHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="leads-table-sort-email"
        >
          Email
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Email",
      cell: ({ row }: LeadCellContext) => {
        const lead = row.original as LeadRow;
        return <span className="text-xs text-slate-600 truncate">{lead.email}</span>;
      },
      size: 160,
    },
    {
      accessorKey: "phone",
      header: features.sorting ? ({ column }: LeadHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="leads-table-sort-phone"
        >
          Phone
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Phone",
      cell: ({ row }: LeadCellContext) => {
        const lead = row.original as LeadRow;
        return <span className="text-xs text-slate-600">{lead.phone ?? "-"}</span>;
      },
      size: 130,
    },
    {
      accessorKey: "status",
      header: features.sorting ? ({ column }: LeadHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="leads-table-sort-status"
        >
          Status
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Status",
      cell: ({ row }: LeadCellContext) => {
        const lead = row.original as LeadRow;
        const statusColor = statusColors[lead.status] || statusColors.Cold;
        return (
          <Badge variant="outline" className={`text-xs font-medium px-2 py-1 ${statusColor}`}>
            {lead.status}
          </Badge>
        );
      },
      size: 100,
    },
    {
      accessorKey: "score",
      header: features.sorting ? ({ column }: LeadHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="leads-table-sort-score"
        >
          Score
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Score",
      cell: ({ row }: LeadCellContext) => {
        const lead = row.original as LeadRow;
        return renderLeadScore(lead.score);
      },
      size: 120,
    },
    {
      accessorKey: "lastContact",
      header: features.sorting ? ({ column }: LeadHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="leads-table-sort-lastcontact"
        >
          Last Contact
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Last Contact",
      cell: ({ row }: LeadCellContext) => {
        const lead = row.original as LeadRow;
        return <span className="text-xs text-slate-500">{lead.lastContact ?? "-"}</span>;
      },
      size: 110,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: LeadCellContext) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" data-test-id={`leads-table-action-contact-${row.id}`}>
            Contact
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" data-test-id={`leads-table-action-email-${row.id}`}>
            Email
          </Button>
        </div>
      ),
      size: 140,
    },
  ];

  const title = config.title ?? "Sales Leads";

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(features.sorting && {
      getSortedRowModel: getSortedRowModel(),
      state: { sorting: tableState.sorting },
      onSortingChange: (updater: ((old: typeof tableState.sorting) => typeof tableState.sorting) | typeof tableState.sorting) => {
        const newSorting = typeof updater === "function" ? updater(tableState.sorting) : updater;
        tableState.setSorting(newSorting);
      },
    }),
    ...(features.filtering && {
      getFilteredRowModel: getFilteredRowModel(),
      state: { columnFilters: Object.entries(tableState.filtering).map(([id, value]) => ({ id, value })) },
      onColumnFiltersChange: (updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState) => {
        const newFilters = typeof updater === "function" ? updater([]) : updater;
        tableState.clearFiltering();
        newFilters.forEach((f: { id: string; value: unknown }) => {
          tableState.setFiltering(f.id, f.value as string);
        });
      },
    }),
    ...(features.pagination && {
      getPaginationRowModel: getPaginationRowModel(),
      state: { pagination: tableState.pagination },
      onPaginationChange: (updater: ((old: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number }) | { pageIndex: number; pageSize: number }) => {
        const newState = typeof updater === "function" ? updater(tableState.pagination) : updater;
        tableState.setPageIndex(newState.pageIndex);
      },
    }),
    ...(features.rowSelection && {
      state: { rowSelection: tableState.rowSelection },
      onRowSelectionChange: (updater: ((old: Record<string, boolean>) => Record<string, boolean>) | Record<string, boolean>) => {
        const newSelection = typeof updater === "function" ? updater(tableState.rowSelection) : updater;
        tableState.setRowSelection(newSelection);
      },
    }),
  });

  console.log(`[DEBUG] LeadsTableWidget rendered`, { rows: rows.length, features, selectedCount: Object.keys(tableState.rowSelection).length });

  return (
    <div data-test-id="leads-table-container" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-700" data-test-id="leads-table-title">
          {title}
        </p>
        <div className="flex items-center gap-2">
          {features.filtering && (
            <Input
              placeholder="Search leads..."
              value={tableState.filtering["name"] ?? ""}
              onChange={(e) => tableState.setFiltering("name", e.target.value)}
              className="h-7 text-xs w-40"
              data-test-id="leads-table-filter-input"
            />
          )}
          {features.columnVisibility && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                const allVisible = Object.values(table.getState().columnVisibility).every((v) => v !== false);
                table.toggleAllColumnsVisible(!allVisible);
              }}
              data-test-id="leads-table-toggle-columns"
            >
              <Eye size={12} className="mr-1" />
              Columns
            </Button>
          )}
          {features.rowSelection && Object.keys(tableState.rowSelection).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => tableState.clearRowSelection()}
              data-test-id="leads-table-clear-selection"
            >
              <Trash2 size={12} className="mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-xs border-collapse" data-test-id="leads-table-table">
          <thead data-test-id="leads-table-thead">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-slate-50 border-b-2 border-slate-200" data-test-id="leads-table-thead-row">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="text-left py-2.5 px-3 font-semibold text-slate-600 uppercase tracking-wide"
                    data-test-id={`leads-table-th-${h.id}`}
                    style={{ width: h.getSize() !== 150 ? `${h.getSize()}px` : undefined }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody data-test-id="leads-table-tbody">
            {table.getRowModel().rows.map((row) => {
              const isExpanded = expandedRows.has(row.id);
              const lead = row.original as LeadRow;
              return (
                <React.Fragment key={row.id}>
                  <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-test-id={`leads-table-row-${row.id}`}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-2.5 px-3" data-test-id={`leads-table-cell-${cell.id}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && features.expandableRows && (
                    <tr className="border-b-2 border-slate-100 bg-slate-50" data-test-id={`leads-table-expand-detail-${row.id}`}>
                      <td colSpan={columns.length} className="px-4 py-3">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-slate-700 mb-1">Contact Info</p>
                              <div className="space-y-1 text-xs">
                                <p className="text-slate-600">Email: {lead.email}</p>
                                <p className="text-slate-600">Phone: {lead.phone ?? "-"}</p>
                                <p className="text-slate-600">Company: {lead.company ?? "-"}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-700 mb-1">Status & Score</p>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-600">Status: {lead.status}</p>
                                <p className="text-xs text-slate-600">Lead Score: {lead.score}/100</p>
                                {lead.tags && lead.tags.length > 0 && (
                                  <div className="flex gap-1 flex-wrap mt-1">
                                    {lead.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs py-0.5">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {lead.notes && (
                            <div>
                              <p className="text-xs font-semibold text-slate-700 mb-1">Notes</p>
                              <p className="text-xs text-slate-600">{lead.notes}</p>
                            </div>
                          )}
                          {lead.conversationHistory && lead.conversationHistory.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-700 mb-1">Conversation History</p>
                              <ul className="list-disc list-inside space-y-0.5">
                                {lead.conversationHistory.map((entry, idx) => (
                                  <li key={idx} className="text-xs text-slate-600">
                                    {entry}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {features.pagination && (
        <div className="flex items-center justify-between gap-2 py-2" data-test-id="leads-table-pagination">
          <span className="text-xs text-slate-600" data-test-id="leads-table-page-info">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => tableState.setPageIndex(table.getState().pagination.pageIndex - 1)}
              disabled={!table.getCanPreviousPage()}
              data-test-id="leads-table-prev-page"
            >
              <ChevronLeft size={12} />
            </Button>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => tableState.setPageSize(Number(e.target.value))}
              className="h-7 px-2 text-xs border border-slate-200 rounded"
              data-test-id="leads-table-page-size"
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => tableState.setPageIndex(table.getState().pagination.pageIndex + 1)}
              disabled={!table.getCanNextPage()}
              data-test-id="leads-table-next-page"
            >
              <ChevronRightIcon size={12} />
            </Button>
          </div>
        </div>
      )}

      {features.rowSelection && Object.keys(tableState.rowSelection).length > 0 && (
        <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded flex items-center justify-between" data-test-id="leads-table-selection-info">
          <span>{Object.keys(tableState.rowSelection).length} lead(s) selected</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => handleBulkAction("send-email")}
              data-test-id="leads-table-bulk-email"
            >
              Send Email
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => handleBulkAction("change-status")}
              data-test-id="leads-table-bulk-status"
            >
              Change Status
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => handleBulkAction("add-tags")}
              data-test-id="leads-table-bulk-tags"
            >
              Add Tags
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const WIDGET_PREVIEWS: Record<string, (data: PD) => React.ReactElement> = {
  // ── STATS ──────────────────────────────────────────────────────
  "revenue-kpi": (data) => <KpiCard data={data} iconEl={<DollarSign className="w-5 h-5 text-slate-400" />} />,
  "user-growth":     (data) => <KpiCard data={data} iconEl={<Users className="w-5 h-5 text-slate-400" />} />,
  "conversion-rate": (data) => <KpiCard data={data} iconEl={<Target className="w-5 h-5 text-slate-400" />} />,
  "net-profit":      (data) => <KpiCard data={data} iconEl={<DollarSign className="w-5 h-5 text-slate-400" />} />,
  "avg-order-value": (data) => <KpiCard data={data} iconEl={<ShoppingCart className="w-5 h-5 text-slate-400" />} />,
  "churn-rate":      (data) => <KpiCard data={data} iconEl={<TrendingDown className="w-5 h-5 text-slate-400" />} />,
  "mrr":             (data) => <KpiCard data={data} iconEl={<DollarSign className="w-5 h-5 text-slate-400" />} />,
  "customer-ltv":    (data) => <KpiCard data={data} iconEl={<Users className="w-5 h-5 text-slate-400" />} />,
  "bounce-rate":     (data) => <KpiCard data={data} iconEl={<Activity className="w-5 h-5 text-slate-400" />} />,
  "session-duration":(data) => <KpiCard data={data} iconEl={<Clock className="w-5 h-5 text-slate-400" />} />,
  "cart-abandonment":(data) => <KpiCard data={data} iconEl={<ShoppingCart className="w-5 h-5 text-slate-400" />} />,

  "sparkline": (data) => {
    const v = (data.value as string) ?? "2,543";
    const label = (data.label as string) ?? "Page Views";
    const bars = (data.bars as number[]) ?? [30,45,35,60,50,70,65,80,75,85,90,95];
    const period = (data.period as string) ?? "Today";
    const iconName = (data.icon as string | undefined) ?? null;
    const iconEl = iconName ? <DynamicIcon name={iconName} className="w-5 h-5 text-slate-400" /> : <Zap className="w-5 h-5 text-slate-400" />;
    return (
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between">{iconEl}<span className="text-xs text-slate-400 font-medium">{period}</span></div>
        <div><p className="text-2xl font-bold text-slate-900">{v}</p><p className="text-xs text-slate-500 mt-0.5">{label}</p></div>
        <div className="flex items-end gap-0.5 h-10 mt-1">{bars.map((h,i)=><div key={i} className="flex-1 bg-blue-400 rounded-sm" style={{height:`${h}%`}} />)}</div>
      </div>
    );
  },

  "satisfaction": (data) => {
    const v = (data.value as string) ?? "4.8";
    const label = (data.label as string) ?? "Customer Satisfaction";
    const filled = (data.filledStars as number) ?? 4;
    const reviews = (data.reviews as number) ?? 1234;
    const iconName = (data.icon as string | undefined) ?? null;
    const iconEl = iconName ? <DynamicIcon name={iconName} className="w-5 h-5 text-yellow-400" /> : <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />;
    return (
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between">{iconEl}<span className="text-xs text-slate-400">{reviews.toLocaleString()} reviews</span></div>
        <div><p className="text-2xl font-bold text-slate-900">{v} / 5.0</p><p className="text-xs text-slate-500 mt-0.5">{label}</p></div>
        <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><Star key={s} className={`w-4 h-4 ${s<=filled?"text-yellow-400 fill-yellow-400":"text-slate-200"}`}/>)}</div>
      </div>
    );
  },

  "realtime-users": (data) => {
    const v = (data.value as string) ?? "1,234";
    const label = (data.label as string) ?? "Active Users Now";
    const period = (data.period as string) ?? "Online right now";
    const iconName = (data.icon as string | undefined) ?? null;
    const iconEl = iconName ? <DynamicIcon name={iconName} className="w-5 h-5 text-slate-400" /> : <Users className="w-5 h-5 text-slate-400" />;
    return (
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between">{iconEl}<div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-xs text-green-600 font-medium">Live</span></div></div>
        <div><p className="text-2xl font-bold text-slate-900">{v}</p><p className="text-xs text-slate-500 mt-0.5">{label}</p></div>
        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 rounded-md px-2 py-1 w-fit"><Activity className="w-3.5 h-3.5" /><span className="text-xs font-semibold">{period}</span></div>
      </div>
    );
  },

  "weekly-summary": (data) => {
    const metrics = (data.metrics as {label:string;value:string;color:string}[]) ?? [{label:"Orders",value:"234",color:"blue"},{label:"Revenue",value:"$12K",color:"emerald"},{label:"Users",value:"1.2K",color:"violet"},{label:"Tasks",value:"45",color:"orange"}];
    const colorMap: Record<string,string> = {blue:"bg-blue-50 text-blue-700",emerald:"bg-emerald-50 text-emerald-700",violet:"bg-violet-50 text-violet-700",orange:"bg-orange-50 text-orange-700"};
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between mb-1"><p className="text-sm font-bold text-slate-800">This Week</p><Calendar className="w-4 h-4 text-indigo-500" /></div>
        <div className="grid grid-cols-2 gap-2">{metrics.map(m=><div key={m.label} className={`rounded-lg p-2 ${colorMap[m.color]??"bg-slate-50 text-slate-700"}`}><p className="text-xs opacity-70">{m.label}</p><p className="text-base font-bold">{m.value}</p></div>)}</div>
      </div>
    );
  },

  // ── CHARTS ──────────────────────────────────────────────────────
  "revenue-chart": (data) => {
    const bars = (data.bars as number[]) ?? [50,65,80,100,75,90];
    const labels = (data.labels as string[]) ?? ["Jan","Feb","Mar","Apr","May","Jun"];
    const title = (data.title as string) ?? "Monthly Revenue";
    const iconName = (data.icon as string | undefined) ?? null;
    const iconEl = iconName ? <DynamicIcon name={iconName} className="w-4 h-4 text-violet-500" /> : <BarChart3 className="w-4 h-4 text-violet-500" />;
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between flex-shrink-0"><p className="text-sm font-bold text-slate-800">{title}</p>{iconEl}</div>
        <div className="flex items-end gap-1.5 flex-1 min-h-[60px] mt-1">{bars.map((h,i)=><div key={i} className="flex-1 rounded-t-sm" style={{height:`${h}%`,background:`hsl(${255+i*8},70%,${50+i*3}%)`}} />)}</div>
        <div className="flex justify-between text-xs text-slate-400 px-0.5 flex-shrink-0">{labels.map(m=><span key={m}>{m}</span>)}</div>
      </div>
    );
  },

  "activity-chart": (data) => {
    const bars = (data.bars as number[]) ?? [40,60,45,80,55,70,65,85,75,90,80,95];
    const title = (data.title as string) ?? "User Activity";
    const iconName = (data.icon as string | undefined) ?? null;
    const iconEl = iconName ? <DynamicIcon name={iconName} className="w-4 h-4 text-blue-500" /> : <Activity className="w-4 h-4 text-blue-500" />;
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between flex-shrink-0"><p className="text-sm font-bold text-slate-800">{title}</p>{iconEl}</div>
        <div className="flex items-end gap-0.5 flex-1 min-h-[60px]">{bars.map((h,i)=><div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-600 to-blue-300" style={{height:`${h}%`}} />)}</div>
      </div>
    );
  },

  "traffic-pie": (data) => {
    const segments = (data.segments as {label:string;value:string;pct:number;color:string}[]) ?? [{label:"Direct",value:"45%",pct:45,color:"#6366f1"},{label:"Organic",value:"30%",pct:30,color:"#a855f7"},{label:"Social",value:"25%",pct:25,color:"#ec4899"}];
    const title = (data.title as string) ?? "Traffic Sources";
    const iconName = (data.icon as string | undefined) ?? null;
    const iconEl = iconName ? <DynamicIcon name={iconName} className="w-4 h-4 text-indigo-500" /> : <PieChart className="w-4 h-4 text-indigo-500" />;
    let pcts = 0;
    const conic = segments.map(s=>{const start=pcts;pcts+=s.pct;return `${s.color} ${start}% ${pcts}%`;}).join(",");
    return (
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{title}</p>{iconEl}</div>
        <div className="flex items-center gap-3 flex-1">
          <div className="aspect-square h-full max-h-24 rounded-full flex-shrink-0" style={{background:`conic-gradient(${conic})`}} />
          <div className="space-y-1 flex-1">{segments.map(s=><div key={s.label} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:s.color}} /><span className="text-xs text-slate-600">{s.label}</span><span className="text-xs font-semibold ml-auto">{s.value}</span></div>)}</div>
        </div>
      </div>
    );
  },

  "heatmap": (data) => {
    const cells = (data.cells as number) ?? 35;
    const palette = (data.palette as string[]) ?? ["bg-slate-100","bg-emerald-200","bg-emerald-400","bg-emerald-600"];
    const title = (data.title as string) ?? "Performance Heatmap";
    const iconName = (data.icon as string | undefined) ?? null;
    const iconEl = iconName ? <DynamicIcon name={iconName} className="w-4 h-4 text-orange-500" /> : <Calendar className="w-4 h-4 text-orange-500" />;
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{title}</p>{iconEl}</div>
        <div className="grid grid-cols-7 gap-0.5">{Array.from({length:cells},(_,i)=><div key={i} className={`aspect-square rounded-sm ${palette[i%palette.length]}`} />)}</div>
      </div>
    );
  },

  "line-trend": (data) => {
    const points = (data.points as number[]) ?? [20,35,28,45,38,55,48,62,55,70,65,78];
    const labels = (data.labels as string[]) ?? [];
    const title = (data.title as string) ?? "Revenue Trend";
    const iconName = (data.icon as string | undefined) ?? null;
    const iconEl = iconName ? <DynamicIcon name={iconName} className="w-4 h-4 text-emerald-500" /> : <TrendingUp className="w-4 h-4 text-emerald-500" />;
    const chartData = points.map((p, i) => ({ name: labels[i] ?? `${i + 1}`, value: p }));
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between flex-shrink-0"><p className="text-sm font-bold text-slate-800">{title}</p>{iconEl}</div>
        <div className="flex-1 min-h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#94a3b8" }} interval="preserveStartEnd" hide />
              <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} width={20} />
              <RechartsTooltip contentStyle={{ fontSize: 11, padding: "4px 8px" }} />
              <Line type="monotone" dataKey="value" name={title} stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  },

  "area-traffic": (data) => {
    const points = (data.points as number[]) ?? [30,45,35,60,50,70,65,80,75,90];
    const title = (data.title as string) ?? "Website Traffic";
    const iconName = (data.icon as string | undefined) ?? null;
    const iconEl = iconName ? <DynamicIcon name={iconName} className="w-4 h-4 text-cyan-500" /> : <BarChart3 className="w-4 h-4 text-cyan-500" />;
    const max = Math.max(...points);
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between flex-shrink-0"><p className="text-sm font-bold text-slate-800">{title}</p>{iconEl}</div>
        <div className="flex items-end gap-0.5 flex-1 min-h-[60px]">{points.map((p,i)=><div key={i} className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-200 rounded-t-sm" style={{height:`${(p/max)*100}%`}} />)}</div>
      </div>
    );
  },

  "donut-budget": (data) => {
    const segments = (data.segments as {label:string;value:number;color:string}[]) ?? [{label:"Engineering",value:40,color:"#6366f1"},{label:"Marketing",value:35,color:"#a855f7"},{label:"Sales",value:15,color:"#ec4899"},{label:"Other",value:10,color:"#f59e0b"}];
    const title = (data.title as string) ?? "Budget Allocation";
    const iconName = (data.icon as string | undefined) ?? null;
    const iconEl = iconName ? <DynamicIcon name={iconName} className="w-4 h-4 text-violet-500" /> : <PieChart className="w-4 h-4 text-violet-500" />;
    let pcts = 0;
    const conic = segments.map(s=>{const start=pcts;pcts+=s.value;return `${s.color} ${start}% ${pcts}%`;}).join(",");
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{title}</p>{iconEl}</div>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex-shrink-0">
            <div className="w-14 h-14 rounded-full" style={{background:`conic-gradient(${conic})`}} />
            <div className="absolute inset-2 bg-white rounded-full" />
          </div>
          <div className="space-y-1">{segments.slice(0,3).map(s=><div key={s.label} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:s.color}} /><span className="text-xs text-slate-600">{s.label}</span><span className="text-xs font-semibold ml-auto">{s.value}%</span></div>)}</div>
        </div>
      </div>
    );
  },

  "horizontal-bar": (data) => {
    const bars = (data.bars as {label:string;value:number}[]) ?? [{label:"Q1",value:65},{label:"Q2",value:80},{label:"Q3",value:72},{label:"Q4",value:91}];
    const title = (data.title as string) ?? "Quarterly Performance";
    const max = Math.max(...bars.map(b=>b.value));
    return (
      <div className="flex flex-col h-full gap-2">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        {bars.map(b=>(
          <div key={b.label} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-6 flex-shrink-0">{b.label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2"><div className="h-2 bg-violet-500 rounded-full" style={{width:`${(b.value/max)*100}%`}} /></div>
            <span className="text-xs font-semibold text-slate-700 w-8 text-right">{b.value}</span>
          </div>
        ))}
      </div>
    );
  },

  "stacked-bar": (data) => {
    const groups = (data.groups as {label:string;a:number;b:number;c:number}[]) ?? [{label:"Jan",a:40,b:30,c:20},{label:"Feb",a:45,b:35,c:25},{label:"Mar",a:50,b:32,c:28}];
    const legend = (data.legend as string[]) ?? ["Organic","Paid","Email"];
    const title = (data.title as string) ?? "Revenue by Channel";
    const colors = ["bg-violet-500","bg-blue-400","bg-cyan-400"];
    return (
      <div className="flex flex-col h-full gap-2">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <div className="flex items-end gap-3 h-16">{groups.map(g=>{const total=g.a+g.b+g.c;return(<div key={g.label} className="flex-1 flex flex-col-reverse gap-0.5"><span className="text-xs text-slate-400 text-center mt-1">{g.label}</span>{([g.a,g.b,g.c]).map((v,i)=><div key={i} className={`${colors[i]} rounded-sm`} style={{height:`${(v/total)*56}px`}} />)}</div>);})}</div>
        <div className="flex gap-3">{legend.map((l,i)=><div key={l} className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${colors[i]}`}/><span className="text-xs text-slate-500">{l}</span></div>)}</div>
      </div>
    );
  },

  // ── PROGRESS ────────────────────────────────────────────────────
  "sales-target": (data) => {
    const pct = (data.pct as number) ?? 75;
    const currentLabel = (data.currentLabel as string) ?? "$75,000";
    const targetLabel = (data.targetLabel as string) ?? "$100,000";
    const label = (data.label as string) ?? "Sales Target";
    return (
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{label}</p><Target className="w-4 h-4 text-emerald-500" /></div>
        <div className="flex justify-between text-xs text-slate-500"><span>{currentLabel}</span><span className="font-semibold text-slate-700">{targetLabel}</span></div>
        <Progress value={pct} className="h-2.5" />
        <p className="text-xs text-slate-500 text-center">{pct}% Complete</p>
      </div>
    );
  },

  "goal-tracker": (data) => {
    const goals = (data.goals as {name:string;pct:number}[]) ?? [{name:"Revenue",pct:85},{name:"Users",pct:70},{name:"Engagement",pct:92}];
    const title = (data.title as string) ?? "Quarterly Goals";
    return (
      <div className="flex flex-col h-full gap-2.5">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        {goals.map(g=><div key={g.name}><div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700">{g.name}</span><span className="text-slate-500">{g.pct}%</span></div><Progress value={g.pct} className="h-1.5" /></div>)}
      </div>
    );
  },

  "department-budget": (data) => {
    const depts = (data.departments as {name:string;used:number;total:number}[]) ?? [{name:"Engineering",used:78,total:100},{name:"Marketing",used:52,total:100},{name:"Sales",used:91,total:100}];
    const title = (data.title as string) ?? "Department Budgets";
    return (
      <div className="flex flex-col h-full gap-2.5">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        {depts.map(d=>{const pct=Math.round((d.used/d.total)*100);return(<div key={d.name}><div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700">{d.name}</span><span className={pct>85?"text-red-500":"text-slate-500"}>{pct}%</span></div><Progress value={pct} className="h-1.5" /></div>);})}
      </div>
    );
  },

  "sprint-progress": (data) => {
    const sprint = (data.sprint as string) ?? "Sprint 12";
    const done = (data.done as number) ?? 18;
    const total = (data.total as number) ?? 24;
    const pct = (data.pct as number) ?? Math.round((done/total)*100);
    const daysLeft = (data.daysLeft as number) ?? 3;
    return (
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{sprint}</p><span className="text-xs text-orange-500 font-medium">{daysLeft}d left</span></div>
        <Progress value={pct} className="h-3" />
        <div className="flex justify-between text-xs text-slate-500"><span>{done} tasks done</span><span>{total-done} remaining</span></div>
      </div>
    );
  },

  // ── ACTIVITY ────────────────────────────────────────────────────
  "activity-feed": (data) => {
    const items = (data.items as {color:string;text:string;time:string}[]) ?? [{color:"bg-emerald-500",text:"New user signed up",time:"2 min ago"},{color:"bg-blue-500",text:"Order #1234 completed",time:"15 min ago"},{color:"bg-violet-500",text:"Payment received",time:"1 hr ago"}];
    return (
      <div className="flex flex-col h-full gap-2">
        <p className="text-sm font-bold text-slate-800">Recent Activity</p>
        {items.map(item=><div key={item.text} className="flex items-start gap-2.5"><div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.color}`} /><div className="flex-1 min-w-0"><p className="text-xs font-medium text-slate-800 truncate">{item.text}</p><p className="text-xs text-slate-400">{item.time}</p></div></div>)}
      </div>
    );
  },

  "error-log": (data) => {
    const items = (data.items as {level:string;message:string;time:string}[]) ?? [{level:"error",message:"TypeError in /api/widgets",time:"5 min ago"},{level:"warn",message:"High memory usage",time:"12 min ago"},{level:"info",message:"Deployment succeeded",time:"1 hr ago"}];
    const colors: Record<string,string> = {error:"text-red-600 bg-red-50",warn:"text-yellow-600 bg-yellow-50",info:"text-blue-600 bg-blue-50"};
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">Error Log</p><AlertTriangle className="w-4 h-4 text-red-500" /></div>
        {items.map(item=><div key={item.message} className={`flex items-start gap-2 p-1.5 rounded-md ${colors[item.level]??"text-slate-600 bg-slate-50"}`}><span className="text-xs font-bold uppercase opacity-80">{item.level}</span><p className="text-xs truncate flex-1">{item.message}</p><span className="text-xs opacity-60 flex-shrink-0">{item.time}</span></div>)}
      </div>
    );
  },

  "notification-center": (data) => {
    const notes = (data.notifications as {title:string;text:string;time:string;color:string}[]) ?? [{title:"New comment",text:"Alice commented on your post",time:"2 min ago",color:"bg-blue-500"},{title:"Task complete",text:"Deploy succeeded",time:"30 min ago",color:"bg-emerald-500"},{title:"Low stock",text:"Widget Lite running low",time:"1 hr ago",color:"bg-yellow-500"}];
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">Notifications</p><Bell className="w-4 h-4 text-blue-500" /></div>
        {notes.map(n=><div key={n.title} className="flex items-start gap-2"><div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${n.color}`} /><div className="flex-1 min-w-0"><p className="text-xs font-medium text-slate-800">{n.title}</p><p className="text-xs text-slate-400 truncate">{n.text}</p></div><span className="text-xs text-slate-400 flex-shrink-0">{n.time}</span></div>)}
      </div>
    );
  },

  "audit-trail": (data) => {
    const entries = (data.entries as {user:string;action:string;time:string}[]) ?? [{user:"Alice M.",action:"Updated pricing config",time:"3 min ago"},{user:"Bob K.",action:"Exported customer data",time:"1 hr ago"},{user:"Admin",action:"New role assigned",time:"2 hrs ago"}];
    return (
      <div className="flex flex-col h-full gap-2">
        <p className="text-sm font-bold text-slate-800">Audit Trail</p>
        {entries.map(e=><div key={e.action} className="flex items-start gap-2 p-1.5 bg-slate-50 rounded-md"><div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">{e.user[0]}</div><div className="flex-1 min-w-0"><p className="text-xs font-medium text-slate-700">{e.user}</p><p className="text-xs text-slate-400 truncate">{e.action}</p></div><span className="text-xs text-slate-400 flex-shrink-0">{e.time}</span></div>)}
      </div>
    );
  },

  // ── LISTS ───────────────────────────────────────────────────────
  "top-products": (data) => {
    const items = (data.items as {name:string;sales:number;pct:number}[]) ?? [{name:"Widget Pro",sales:234,pct:95},{name:"Widget Lite",sales:189,pct:77},{name:"Widget Max",sales:156,pct:63}];
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">Top Products</p><ShoppingCart className="w-4 h-4 text-teal-500" /></div>
        {items.map(p=><div key={p.name} className="flex items-center gap-2"><div className="flex-1 min-w-0"><p className="text-xs font-medium text-slate-700">{p.name}</p><div className="h-1 bg-slate-100 rounded-full mt-1"><div className="h-1 bg-teal-500 rounded-full" style={{width:`${p.pct}%`}} /></div></div><span className="text-xs text-slate-500 font-medium">{p.sales}</span></div>)}
      </div>
    );
  },

  "team-performance": (data) => {
    const members = (data.members as {name:string;score:number}[]) ?? [{name:"Alice",score:95},{name:"Bob",score:88},{name:"Charlie",score:92}];
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">Team Performance</p><Users className="w-4 h-4 text-indigo-500" /></div>
        {members.map(m=><div key={m.name} className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{m.name[0]}</div><div className="flex-1"><p className="text-xs font-medium text-slate-700">{m.name}</p><Progress value={m.score} className="h-1 mt-0.5" /></div><span className="text-xs font-bold text-slate-600">{m.score}%</span></div>)}
      </div>
    );
  },

  // ── COMPARISON ──────────────────────────────────────────────────
  "comparison": (data) => {
    const metrics = (data.metrics as {metric:string;curr:string;prev:string;up:boolean}[]) ?? [{metric:"Revenue",curr:"$45,231",prev:"$40,200",up:true},{metric:"Orders",curr:"1,543",prev:"1,620",up:false}];
    const title = (data.title as string) ?? "This vs Last Month";
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{title}</p><BarChart3 className="w-4 h-4 text-pink-500" /></div>
        {metrics.map(item=><div key={item.metric} className="p-2 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500 mb-1">{item.metric}</p><div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-900">{item.curr}</span><div className={`flex items-center gap-1 text-xs font-semibold ${item.up?"text-emerald-600":"text-red-500"}`}>{item.up?<ArrowUpRight className="w-3.5 h-3.5"/>:<ArrowDownRight className="w-3.5 h-3.5"/>}<span>{item.prev}</span></div></div></div>)}
      </div>
    );
  },

  "revenue-target": (data) => {
    const pct = (data.pct as number) ?? 85;
    const actualLabel = (data.actualLabel as string) ?? "$85,000";
    const targetLabel = (data.targetLabel as string) ?? "$100,000";
    const remaining = (data.remaining as string) ?? "$15,000 to go";
    return (
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">Revenue vs Target</p><Target className="w-4 h-4 text-pink-500" /></div>
        <div className="space-y-1.5"><div className="flex justify-between text-xs"><span className="text-slate-500">Actual</span><span className="font-bold text-emerald-600">{actualLabel}</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Target</span><span className="font-bold text-slate-800">{targetLabel}</span></div></div>
        <Progress value={pct} className="h-2" />
        <p className="text-xs text-center text-slate-400">{remaining}</p>
      </div>
    );
  },

  "yoy-comparison": (data) => {
    const metrics = (data.metrics as {label:string;curr:string;prev:string;up:boolean}[]) ?? [{label:"Revenue",curr:"$892K",prev:"$743K",up:true},{label:"Customers",curr:"24.5K",prev:"19.2K",up:true}];
    const currentYear = (data.currentYear as number) ?? 2026;
    const lastYear = (data.lastYear as number) ?? 2025;
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">YoY Comparison</p><BarChart3 className="w-4 h-4 text-pink-500" /></div>
        <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{lastYear}</span><span>{currentYear}</span></div>
        {metrics.map(m=><div key={m.label} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"><span className="text-xs font-medium text-slate-700">{m.label}</span><div className="flex items-center gap-3"><span className="text-xs text-slate-400">{m.prev}</span><div className={m.up?"text-emerald-600":"text-red-500"}>{m.up?<ArrowUpRight className="w-3.5 h-3.5"/>:<ArrowDownRight className="w-3.5 h-3.5"/>}</div><span className="text-xs font-bold text-slate-900">{m.curr}</span></div></div>)}
      </div>
    );
  },

  "channel-attribution": (data) => {
    const channels = (data.channels as {label:string;value:number;pct:number;color:string}[]) ?? [{label:"Organic",value:35,pct:35,color:"#6366f1"},{label:"Paid",value:28,pct:28,color:"#a855f7"},{label:"Email",value:22,pct:22,color:"#ec4899"},{label:"Referral",value:15,pct:15,color:"#f59e0b"}];
    const title = (data.title as string) ?? "Channel Attribution";
    return (
      <div className="flex flex-col h-full gap-2">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        {channels.map(c=><div key={c.label} className="flex items-center gap-2"><span className="text-xs text-slate-500 w-14 flex-shrink-0">{c.label}</span><div className="flex-1 bg-slate-100 rounded-full h-2"><div className="h-2 rounded-full" style={{width:`${c.pct}%`,background:c.color}} /></div><span className="text-xs font-semibold text-slate-700 w-8 text-right">{c.pct}%</span></div>)}
      </div>
    );
  },

  "region-breakdown": (data) => {
    const regions = (data.regions as {name:string;value:string;pct:number;color:string}[]) ?? [{name:"North America",value:"45%",pct:45,color:"#6366f1"},{name:"Europe",value:"30%",pct:30,color:"#a855f7"},{name:"Asia Pacific",value:"18%",pct:18,color:"#ec4899"},{name:"Other",value:"7%",pct:7,color:"#f59e0b"}];
    const title = (data.title as string) ?? "Regional Breakdown";
    return (
      <div className="flex flex-col h-full gap-2">
        <p className="text-sm font-bold text-slate-800">{title}</p>
        {regions.map(r=><div key={r.name} className="flex items-center gap-2"><span className="text-xs text-slate-500 w-20 flex-shrink-0 truncate">{r.name}</span><div className="flex-1 bg-slate-100 rounded-full h-2"><div className="h-2 rounded-full" style={{width:`${r.pct}%`,background:r.color}} /></div><span className="text-xs font-semibold text-slate-700 w-8 text-right">{r.value}</span></div>)}
      </div>
    );
  },

  // ── TABLES ──────────────────────────────────────────────────────
  "orders-table": (data) => {
    const preview = (data._preview as boolean) ?? false;
    return <OrdersTableWidget data={data} preview={preview} />;
  },

  "customers-table": (data) => {
    const preview = (data._preview as boolean) ?? false;
    return <CustomersTableWidget data={data} preview={preview} />;
  },

  "transactions-table": (data) => {
    const preview = (data._preview as boolean) ?? false;
    return <TransactionsTableWidget data={data} preview={preview} />;
  },

  "leads-table": (data) => {
    const preview = (data._preview as boolean) ?? false;
    return <LeadsTableWidget data={data} preview={preview} />;
  },

  "inventory-table": (data) => {
    const rows = (data.rows as {product:string;sku:string;stock:number;status:string}[]) ?? [{product:"Widget Pro",sku:"WGT-001",stock:142,status:"In Stock"},{product:"Dashboard Kit",sku:"DSH-004",stock:8,status:"Low Stock"},{product:"Analytics Pack",sku:"ANL-009",stock:0,status:"Out of Stock"},{product:"Chart Bundle",sku:"CHT-012",stock:56,status:"In Stock"}];
    const title = (data.title as string) ?? "Inventory";
    const statusColor: Record<string,string> = {"In Stock":"text-emerald-700 bg-emerald-50","Low Stock":"text-yellow-700 bg-yellow-50","Out of Stock":"text-red-700 bg-red-50"};
    return (
      <div data-test-id="inventory-table-container">
        <p className="text-xs font-semibold text-slate-700 mb-1.5" data-test-id="inventory-table-title">{title}</p>
        <div data-test-id="inventory-table-scroll">
          <table className="w-full table-fixed text-xs border-collapse" data-test-id="inventory-table-table">
            <thead data-test-id="inventory-table-thead">
              <tr className="border-b border-slate-200 bg-slate-50" data-test-id="inventory-table-thead-row">
                {["Product","SKU","Qty","Status"].map((col,i)=><th key={i} className="text-left py-1 px-1 font-semibold text-slate-500 truncate" data-test-id={`inventory-table-th-${i}`}>{col}</th>)}
              </tr>
            </thead>
            <tbody data-test-id="inventory-table-tbody">
              {rows.slice(0,4).map((r,ri)=>(
                <tr key={ri} className="border-b border-slate-100 last:border-0" data-test-id={`inventory-table-row-${ri}`}>
                  <td className="py-1 px-1 font-medium text-slate-800 truncate" data-test-id={`inventory-table-td-${ri}-0`}>{r.product}</td>
                  <td className="py-1 px-1 font-mono text-slate-500 truncate" data-test-id={`inventory-table-td-${ri}-1`}>{r.sku}</td>
                  <td className={`py-1 px-1.5 font-semibold ${r.stock===0?"text-red-500":r.stock<10?"text-yellow-600":"text-slate-800"}`} data-test-id={`inventory-table-td-${ri}-2`}>{r.stock}</td>
                  <td className="py-1 px-1.5" data-test-id={`inventory-table-td-${ri}-3`}><span className={`px-1.5 py-0.5 rounded-full font-medium ${statusColor[r.status]??"text-slate-600 bg-slate-100"}`} data-test-id={`inventory-table-status-${ri}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },

  // ── HEALTH ──────────────────────────────────────────────────────
  "system-health": (data) => {
    const services = (data.services as {name:string;status:string;ok:boolean}[]) ?? [{name:"API",status:"Operational",ok:true},{name:"Database",status:"Operational",ok:true},{name:"Cache",status:"Degraded",ok:false}];
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">System Health</p><Activity className="w-4 h-4 text-red-500" /></div>
        {services.map(item=><div key={item.name} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"><span className="text-xs font-medium text-slate-700">{item.name}</span><div className={`flex items-center gap-1.5 text-xs font-medium ${item.ok?"text-emerald-600":"text-yellow-600"}`}><div className={`w-1.5 h-1.5 rounded-full ${item.ok?"bg-emerald-500":"bg-yellow-500"}`} />{item.status}</div></div>)}
      </div>
    );
  },

  "api-latency": (data) => {
    const services = (data.services as {name:string;p50:number;p99:number}[]) ?? [{name:"GET /api/users",p50:45,p99:180},{name:"POST /api/orders",p50:120,p99:450},{name:"GET /api/widgets",p50:23,p99:89}];
    const title = (data.title as string) ?? "API Latency";
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{title}</p><Activity className="w-4 h-4 text-orange-500" /></div>
        <div className="flex justify-end gap-4 text-xs text-slate-400 mb-1"><span>P50</span><span>P99</span></div>
        {services.map(s=><div key={s.name} className="flex items-center gap-2"><p className="text-xs text-slate-600 flex-1 truncate">{s.name}</p><span className="text-xs font-semibold text-emerald-600 w-12 text-right">{s.p50}ms</span><span className={`text-xs font-semibold w-12 text-right ${s.p99>400?"text-red-500":"text-yellow-600"}`}>{s.p99}ms</span></div>)}
      </div>
    );
  },

  "error-rate": (data) => {
    const v = (data.value as string) ?? "0.23%";
    const label = (data.label as string) ?? "Error Rate";
    const bars = (data.bars as number[]) ?? [2,1,3,1,0,2,1];
    const period = (data.period as string) ?? "Last 7 days";
    const max = Math.max(...bars,1);
    return (
      <div className="flex flex-col h-full gap-3">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{label}</p><AlertTriangle className="w-4 h-4 text-red-500" /></div>
        <div><p className="text-2xl font-bold text-slate-900">{v}</p><p className="text-xs text-slate-400 mt-0.5">{period}</p></div>
        <div className="flex items-end gap-1 h-8">{bars.map((b,i)=><div key={i} className="flex-1 rounded-sm bg-red-400" style={{height:`${(b/max)*100}%`}} />)}</div>
      </div>
    );
  },

  "uptime-monitor": (data) => {
    const services = (data.services as {name:string;uptime:number;status:string}[]) ?? [{name:"API",uptime:99.98,status:"up"},{name:"Database",uptime:99.95,status:"up"},{name:"CDN",uptime:100,status:"up"},{name:"Auth",uptime:98.2,status:"degraded"}];
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">Uptime Monitor</p><Activity className="w-4 h-4 text-emerald-500" /></div>
        {services.map(s=><div key={s.name} className="flex items-center justify-between"><span className="text-xs text-slate-600">{s.name}</span><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${s.status==="up"?"bg-emerald-500":"bg-yellow-500"}`} /><span className={`text-xs font-semibold ${s.uptime>=99.9?"text-emerald-600":"text-yellow-600"}`}>{s.uptime}%</span></div></div>)}
      </div>
    );
  },

  // ── TIMELINE ────────────────────────────────────────────────────
  "timeline": (data) => {
    const events = (data.events as {title:string;time:string;color:string}[]) ?? [{title:"Product Launch",time:"Today",color:"bg-indigo-500"},{title:"Team Meeting",time:"Tomorrow",color:"bg-violet-500"},{title:"Q4 Review",time:"Next Week",color:"bg-blue-500"}];
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">Upcoming Events</p><Clock className="w-4 h-4 text-indigo-500" /></div>
        {events.map(item=><div key={item.title} className="flex items-start gap-2.5"><div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.color}`} /><div className="flex-1 border-l-2 border-slate-100 pl-2.5 pb-1"><p className="text-xs font-medium text-slate-800">{item.title}</p><p className="text-xs text-slate-400">{item.time}</p></div></div>)}
      </div>
    );
  },

  // ── FUNNEL ──────────────────────────────────────────────────────
  "conversion-funnel": (data) => {
    const stages = (data.stages as {label:string;value:number;pct:number}[]) ?? [{label:"Visitors",value:10000,pct:100},{label:"Sign-ups",value:2400,pct:24},{label:"Activated",value:1200,pct:12},{label:"Paid",value:360,pct:3.6}];
    const title = (data.title as string) ?? "Conversion Funnel";
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{title}</p><Filter className="w-4 h-4 text-amber-500" /></div>
        {stages.map((s,i)=><div key={s.label} className="flex items-center gap-2"><div className="flex-1 bg-slate-100 rounded-sm h-5 relative overflow-hidden"><div className="h-5 bg-gradient-to-r from-amber-400 to-amber-300 rounded-sm" style={{width:`${s.pct}%`}} /><span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-slate-700">{s.label}</span></div><div className="text-right flex-shrink-0"><p className="text-xs font-bold text-slate-800">{s.value.toLocaleString()}</p><p className="text-xs text-slate-400">{stages[0] && i>0 ? `${s.pct}%` : "100%"}</p></div></div>)}
      </div>
    );
  },

  "sales-pipeline": (data) => {
    const stages = (data.stages as {label:string;value:number;pct:number}[]) ?? [{label:"Leads",value:450,pct:100},{label:"Qualified",value:280,pct:62},{label:"Proposal",value:140,pct:31},{label:"Closed Won",value:78,pct:17}];
    const title = (data.title as string) ?? "Sales Pipeline";
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{title}</p><ChevronRight className="w-4 h-4 text-amber-500" /></div>
        {stages.map((s,i)=><div key={s.label} className="flex items-center gap-2"><div className="flex-1 bg-slate-100 rounded-sm h-5 relative overflow-hidden"><div className="h-5 rounded-sm" style={{width:`${s.pct}%`,background:`hsl(${40-i*8},80%,${60-i*5}%)`}} /><span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-slate-700">{s.label}</span></div><span className="text-xs font-bold text-slate-700 w-8 text-right">{s.value}</span></div>)}
      </div>
    );
  },

  // ── LEADERBOARD ─────────────────────────────────────────────────
  "agent-leaderboard": (data) => {
    const entries = (data.entries as {rank:number;name:string;score:number;badge:string|null}[]) ?? [{rank:1,name:"Alice M.",score:2840,badge:"gold"},{rank:2,name:"Bob K.",score:2310,badge:"silver"},{rank:3,name:"Carol D.",score:1980,badge:"bronze"},{rank:4,name:"David R.",score:1560,badge:null}];
    const title = (data.title as string) ?? "Top Agents";
    const badgeEl: Record<string,React.ReactElement> = {gold:<Trophy className="w-4 h-4 text-yellow-500" />,silver:<Trophy className="w-4 h-4 text-slate-400" />,bronze:<Trophy className="w-4 h-4 text-amber-700" />};
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{title}</p><Award className="w-4 h-4 text-yellow-500" /></div>
        {entries.slice(0,4).map(e=><div key={e.rank} className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400 w-4">{e.rank}</span><div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{e.name[0]}</div><span className="text-xs font-medium text-slate-700 flex-1">{e.name}</span>{e.badge && badgeEl[e.badge]}<span className="text-xs font-bold text-slate-800">{e.score.toLocaleString()}</span></div>)}
      </div>
    );
  },

  "product-leaderboard": (data) => {
    const entries = (data.entries as {rank:number;name:string;revenue:string;units:number}[]) ?? [{rank:1,name:"Widget Pro",revenue:"$45,200",units:234},{rank:2,name:"Widget Max",revenue:"$32,100",units:145},{rank:3,name:"Widget Lite",revenue:"$18,900",units:312}];
    const title = (data.title as string) ?? "Top Products";
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{title}</p><Award className="w-4 h-4 text-yellow-500" /></div>
        {entries.map(e=><div key={e.rank} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg"><span className={`text-xs font-black w-4 ${e.rank===1?"text-yellow-500":e.rank===2?"text-slate-400":"text-amber-700"}`}>{e.rank}</span><div className="flex-1 min-w-0"><p className="text-xs font-medium text-slate-700">{e.name}</p><p className="text-xs text-slate-400">{e.units} units</p></div><span className="text-xs font-bold text-slate-800">{e.revenue}</span></div>)}
      </div>
    );
  },

  // ── SUMMARY ─────────────────────────────────────────────────────
  "executive-summary": (data) => {
    const kpis = (data.kpis as {label:string;value:string;trend:string;up:boolean}[]) ?? [{label:"Revenue",value:"$892K",trend:"+12%",up:true},{label:"Users",value:"24.5K",trend:"+8%",up:true},{label:"NPS",value:"72",trend:"+5",up:true},{label:"Churn",value:"2.1%",trend:"-0.5%",up:false}];
    const title = (data.title as string) ?? "Executive Summary";
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{title}</p><LayoutDashboard className="w-4 h-4 text-slate-500" /></div>
        <div className="grid grid-cols-2 gap-2">{kpis.map(k=><div key={k.label} className="bg-slate-50 rounded-lg p-2"><p className="text-xs text-slate-400">{k.label}</p><p className="text-sm font-bold text-slate-900">{k.value}</p><span className={`text-xs font-semibold ${k.up?"text-emerald-600":"text-red-500"}`}>{k.trend}</span></div>)}</div>
      </div>
    );
  },

  "monthly-metrics": (data) => {
    const metrics = (data.metrics as {label:string;value:string}[]) ?? [{label:"Total Sales",value:"$124,500"},{label:"New Customers",value:"342"},{label:"Support Tickets",value:"89"},{label:"Avg Resolution",value:"4.2 hrs"}];
    const month = (data.month as string) ?? "This Month";
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{month}</p><Calendar className="w-4 h-4 text-slate-500" /></div>
        <div className="grid grid-cols-2 gap-2">{metrics.map(m=><div key={m.label} className="bg-slate-50 rounded-lg p-2"><p className="text-xs text-slate-400">{m.label}</p><p className="text-sm font-bold text-slate-900">{m.value}</p></div>)}</div>
      </div>
    );
  },

  "kpi-scorecard": (data) => {
    const items = (data.items as {kpi:string;value:string;target:string;status:string}[]) ?? [{kpi:"Revenue Growth",value:"12%",target:"10%",status:"green"},{kpi:"Customer Churn",value:"2.1%",target:"< 3%",status:"green"},{kpi:"NPS Score",value:"72",target:"> 70",status:"green"},{kpi:"Ticket SLA",value:"87%",target:"> 90%",status:"amber"}];
    const title = (data.title as string) ?? "KPI Scorecard";
    const statusColor: Record<string,string> = {green:"bg-emerald-500",amber:"bg-yellow-500",red:"bg-red-500"};
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-800">{title}</p><Target className="w-4 h-4 text-slate-500" /></div>
        {items.map(item=><div key={item.kpi} className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg"><div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor[item.status]??"bg-slate-400"}`} /><span className="text-xs font-medium text-slate-700 flex-1">{item.kpi}</span><span className="text-xs font-bold text-slate-900">{item.value}</span><span className="text-xs text-slate-400">{item.target}</span></div>)}
      </div>
    );
  },

  // ── BUTTON ──────────────────────────────────────────────────────
  "primary-button": (data) => {
    const label = (data.label as string) ?? "Save Changes";
    console.log(`Debug flow: primary-button preview fired with`, { label });
    return (
      <div className="flex h-full items-center" data-test-id="primary-button-container">
        <button className="w-fit px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg" data-test-id="primary-button-btn">{label}</button>
      </div>
    );
  },

  "button-group": (data) => {
    const buttons = (data.buttons as {label:string;variant:string}[]) ?? [{label:"Edit",variant:"outline"},{label:"Share",variant:"outline"},{label:"Delete",variant:"destructive"}];
    const primary = buttons[0] ?? { label: "Edit", variant: "outline" };
    const secondary = buttons.slice(1).map((btn) => btn.label);
    console.log(`Debug flow: button-group preview fired with`, { buttonCount: buttons.length, primary });
    return (
      <div className="flex flex-col h-full justify-center gap-3" data-test-id="button-group-container">
        <p className="text-xs text-slate-500" data-test-id="button-group-label">Action Group</p>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3" data-test-id="button-group-row">
          <div className={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold ${primary.variant === "destructive" ? "border-red-200 bg-red-50 text-red-700" : "border-slate-900 bg-slate-900 text-white"}`} data-test-id="button-group-primary">
            {primary.label}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5" data-test-id="button-group-secondary">
            {secondary.map((label, i) => (
              <span key={label} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600" data-test-id={`button-group-secondary-${i}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  },

  "icon-button-bar": (data) => {
    const buttons = (data.buttons as {tooltip:string}[]) ?? [{tooltip:"Bold"},{tooltip:"Italic"},{tooltip:"Underline"},{tooltip:"Align Left"},{tooltip:"Align Center"}];
    const label: Record<string,string> = {"Bold":"B","Italic":"I","Underline":"U","Align Left":"≡","Align Center":"☰"};
    const activeButton = buttons[0]?.tooltip ?? "Bold";
    console.log(`Debug flow: icon-button-bar preview fired with`, { buttonCount: buttons.length, activeButton });
    return (
      <div className="flex flex-col h-full justify-center gap-3" data-test-id="icon-button-bar-container">
        <p className="text-xs text-slate-500" data-test-id="icon-button-bar-label">Toolbar</p>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3" data-test-id="icon-button-bar-toolbar">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm" data-test-id="icon-button-bar-active">
            {label[activeButton] ?? activeButton[0]}
          </div>
          <div className="mt-2 flex items-center gap-1" data-test-id="icon-button-bar-standalone">
            {buttons.slice(1, 4).map((btn, i) => (
              <span key={btn.tooltip} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500" data-test-id={`icon-button-bar-chip-${i}`}>
                {btn.tooltip}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  },

  "split-button": (data) => {
    const label = (data.label as string) ?? "Export";
    const iconName = (data.icon as string | undefined)?.trim();
    const buttonBgColor = (data.buttonBgColor as string | undefined)?.trim();
    const buttonTextColor = (data.buttonTextColor as string | undefined)?.trim();
    const iconColor = (data.iconColor as string | undefined)?.trim();
    const arrowBgColor = (data.arrowBgColor as string | undefined)?.trim();
    console.log(`Debug flow: split-button preview fired with`, {
      label,
      iconName,
      buttonBgColor,
      buttonTextColor,
      iconColor,
      arrowBgColor,
    });
    return (
      <div className="flex flex-col h-full justify-center gap-3" data-test-id="split-button-container">
        <p className="text-xs text-slate-500" data-test-id="split-button-label">Split Button</p>
        <div
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          style={{
            ...(buttonBgColor ? { backgroundColor: buttonBgColor } : {}),
            ...(buttonTextColor ? { color: buttonTextColor } : {}),
          }}
          data-test-id="split-button-wrapper"
        >
          <span data-test-id="split-button-main">{label}</span>
          <span
            className="rounded-md bg-blue-700/70 p-1"
            style={arrowBgColor ? { backgroundColor: arrowBgColor } : undefined}
            data-test-id="split-button-arrow"
          >
            <span style={iconColor ? { color: iconColor } : undefined} data-test-id="split-button-arrow-icon">
              {iconName
                ? <DynamicIcon name={iconName} className="w-4 h-4" />
                : <ChevronDown className="w-4 h-4" />}
            </span>
          </span>
        </div>
      </div>
    );
  },

  "toggle-button-group": (data) => <ToggleWidget data={data} />,

  "button-left-icon": (data) => {
    const label = (data.label as string) ?? "Create Report";
    const iconName = (data.icon as string | undefined)?.trim();
    const buttonBgColor = (data.buttonBgColor as string | undefined)?.trim();
    const buttonTextColor = (data.buttonTextColor as string | undefined)?.trim();
    const iconColor = (data.iconColor as string | undefined)?.trim();
    console.log(`Debug flow: button-left-icon preview fired with`, { label, iconName, buttonBgColor, buttonTextColor, iconColor });
    return (
      <div className="flex h-full items-center" data-test-id="button-left-icon-container">
        <button
          className="w-full min-w-0 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg inline-flex items-center justify-center gap-2 hover:bg-indigo-700"
          style={{
            ...(buttonBgColor ? { backgroundColor: buttonBgColor } : {}),
            ...(buttonTextColor ? { color: buttonTextColor } : {}),
          }}
          data-test-id="button-left-icon-btn"
        >
          <span style={iconColor ? { color: iconColor } : undefined} data-test-id="button-left-icon-symbol">
            {iconName
              ? <DynamicIcon name={iconName} className="w-4 h-4" />
              : <Plus className="w-4 h-4" />}
          </span>
          <span className="truncate" data-test-id="button-left-icon-label">{label}</span>
        </button>
      </div>
    );
  },

  "button-right-icon": (data) => {
    const label = (data.label as string) ?? "View Details";
    const iconName = (data.icon as string | undefined)?.trim();
    const buttonBgColor = (data.buttonBgColor as string | undefined)?.trim();
    const buttonTextColor = (data.buttonTextColor as string | undefined)?.trim();
    const iconColor = (data.iconColor as string | undefined)?.trim();
    console.log(`Debug flow: button-right-icon preview fired with`, { label, iconName, buttonBgColor, buttonTextColor, iconColor });
    return (
      <div className="flex h-full items-center" data-test-id="button-right-icon-container">
        <button
          className="w-fit px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg inline-flex items-center gap-2 hover:bg-emerald-700"
          style={{
            ...(buttonBgColor ? { backgroundColor: buttonBgColor } : {}),
            ...(buttonTextColor ? { color: buttonTextColor } : {}),
          }}
          data-test-id="button-right-icon-btn"
        >
          <span data-test-id="button-right-icon-label">{label}</span>
          <span style={iconColor ? { color: iconColor } : undefined} data-test-id="button-right-icon-symbol">
            {iconName
              ? <DynamicIcon name={iconName} className="w-4 h-4" />
              : <ArrowUpRight className="w-4 h-4" />}
          </span>
        </button>
      </div>
    );
  },

  "button-primary": (data) => {
    const label = (data.label as string) ?? "Create Report";
    console.log(`Debug flow: button-primary preview fired with`, { label });
    return (
      <div className="flex h-full items-center" data-test-id="button-primary-container">
        <button className="w-fit rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm" data-test-id="button-primary-btn">
          {label}
        </button>
      </div>
    );
  },

  "button-secondary": (data) => {
    const label = (data.label as string) ?? "Save Draft";
    console.log(`Debug flow: button-secondary preview fired with`, { label });
    return (
      <div className="flex h-full items-center" data-test-id="button-secondary-container">
        <button className="w-fit rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm" data-test-id="button-secondary-btn">
          {label}
        </button>
      </div>
    );
  },

  "button-outline": (data) => {
    const label = (data.label as string) ?? "View Details";
    console.log(`Debug flow: button-outline preview fired with`, { label });
    return (
      <div className="flex h-full items-center" data-test-id="button-outline-container">
        <button className="w-fit rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm" data-test-id="button-outline-btn">
          {label}
        </button>
      </div>
    );
  },

  "button-ghost": (data) => {
    const label = (data.label as string) ?? "Skip for now";
    console.log(`Debug flow: button-ghost preview fired with`, { label });
    return (
      <div className="flex h-full items-center" data-test-id="button-ghost-container">
        <button className="w-fit rounded-xl bg-transparent px-4 py-2 text-sm font-semibold text-slate-600" data-test-id="button-ghost-btn">
          {label}
        </button>
      </div>
    );
  },

  "button-link": (data) => {
    const label = (data.label as string) ?? "Open analytics";
    console.log(`Debug flow: button-link preview fired with`, { label });
    return (
      <div className="flex h-full items-center" data-test-id="button-link-container">
        <button className="inline-flex w-full min-w-0 items-center justify-center gap-1 px-1 py-2 text-sm font-semibold text-blue-700" data-test-id="button-link-btn">
          <span className="truncate">{label}</span>
          <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" data-test-id="button-link-icon" />
        </button>
      </div>
    );
  },

  "button-destructive": (data) => {
    const label = (data.label as string) ?? "Delete item";
    console.log(`Debug flow: button-destructive preview fired with`, { label });
    return (
      <div className="flex h-full items-center" data-test-id="button-destructive-container">
        <button className="w-fit rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm" data-test-id="button-destructive-btn">
          {label}
        </button>
      </div>
    );
  },

  "upload-button-solid": (data) => {
    const label = (data.label as string) ?? "Upload file";
    console.log(`Debug flow: upload-button-solid preview fired with`, { label });
    return (
      <div className="flex h-full items-center" data-test-id="upload-button-solid-container">
        <button className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm" data-test-id="upload-button-solid-btn">
          <Upload className="w-4 h-4" data-test-id="upload-button-solid-icon" />
          <span>{label}</span>
        </button>
      </div>
    );
  },

  "upload-button-outline": (data) => {
    const label = (data.label as string) ?? "Upload assets";
    console.log(`Debug flow: upload-button-outline preview fired with`, { label });
    return (
      <div className="flex h-full items-center" data-test-id="upload-button-outline-container">
        <button className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700" data-test-id="upload-button-outline-btn">
          <Upload className="w-4 h-4" data-test-id="upload-button-outline-icon" />
          <span>{label}</span>
        </button>
      </div>
    );
  },

  "upload-button-dashed": (data) => {
    const label = (data.label as string) ?? "Drag and upload";
    console.log(`Debug flow: upload-button-dashed preview fired with`, { label });
    return (
      <div className="flex h-full items-center" data-test-id="upload-button-dashed-container">
        <button className="inline-flex w-fit items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600" data-test-id="upload-button-dashed-btn">
          <Upload className="w-4 h-4" data-test-id="upload-button-dashed-icon" />
          <span>{label}</span>
        </button>
      </div>
    );
  },

  "upload-buttons": (data) => {
    const labels = (data.labels as string[]) ?? ["Upload file", "Upload assets", "Drag and upload"];
    console.log(`Debug flow: upload-buttons preview fired with`, { labelsCount: labels.length, labels });
    return (
      <div className="flex flex-col h-full justify-center gap-3" data-test-id="upload-buttons-container">
        <p className="text-xs text-slate-500" data-test-id="upload-buttons-label">Upload Buttons</p>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3" data-test-id="upload-buttons-shell">
          <div className="w-full rounded-xl bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm" data-test-id="upload-buttons-solid">
            <span className="inline-flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" data-test-id="upload-buttons-solid-icon" />
              <span data-test-id="upload-buttons-solid-label">{labels[0] ?? "Upload file"}</span>
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5" data-test-id="upload-buttons-variants">
            <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700" data-test-id="upload-buttons-outline-label">
              {labels[1] ?? "Upload assets"}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600" data-test-id="upload-buttons-dashed-label">
              {labels[2] ?? "Drag and upload"}
            </span>
          </div>
        </div>
      </div>
    );
  },

  "button-variant-set": (data) => {
    const labels = (data.labels as Record<string, string>) ?? {
      default: "Default",
      secondary: "Secondary",
      outline: "Outline",
      ghost: "Ghost",
      link: "Link",
      destructive: "Destructive",
    };
    const uploadLabels = (data.uploadLabels as string[]) ?? ["Upload file", "Upload assets", "Drag & upload"];
    const leftLabel = (data.leftLabel as string) ?? "Create Report";
    const rightLabel = (data.rightLabel as string) ?? "View Details";
    console.log(`Debug flow: button-variant-set preview fired with`, { labels, uploadLabels, leftLabel, rightLabel });
    return (
      <div className="flex flex-col h-full justify-center gap-3" data-test-id="button-variant-set-container">
        <div className="space-y-0.5" data-test-id="button-variant-set-header">
          <p className="text-xs font-semibold text-slate-700">Button Variants</p>
          <p className="text-[11px] text-slate-500">One primary action with supporting styles</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3" data-test-id="button-variant-set-shell">
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm" data-test-id="button-variant-set-default">
            <Plus className="w-4 h-4" />
            <span>{leftLabel || labels.default}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5" data-test-id="button-variant-set-row">
            {[labels.secondary, labels.outline, labels.ghost, labels.link, labels.destructive, rightLabel, uploadLabels[0]].map((item, index) => (
              <span key={`${item}-${index}`} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600" data-test-id={`button-variant-set-chip-${index}`}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  },

  // ── DROPDOWN ────────────────────────────────────────────────────
  "single-select-dropdown": (data) => <SelectWidget data={data} />,

  "multi-select-dropdown": (data) => {
    const label = (data.label as string) ?? "Assign Labels";
    const selected = (data.selected as string[]) ?? ["bug","feature"];
    const options = (data.options as {value:string;label:string}[]) ?? [{value:"bug",label:"Bug"},{value:"feature",label:"Feature"},{value:"docs",label:"Docs"},{value:"urgent",label:"Urgent"}];
    const tagColors: Record<string,string> = {bug:"bg-red-50 text-red-700",feature:"bg-blue-50 text-blue-700",docs:"bg-slate-100 text-slate-700",urgent:"bg-orange-50 text-orange-700"};
    return (
      <div className="flex flex-col h-full gap-2" data-test-id="multi-select-container">
        <label className="text-xs font-medium text-slate-700" data-test-id="multi-select-label">{label}</label>
        <div className="min-h-[36px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white flex flex-wrap gap-1 items-center cursor-pointer" data-test-id="multi-select-trigger">
          {selected.map((s,i)=><span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColors[s]??"bg-slate-100 text-slate-700"}`} data-test-id={`multi-select-tag-${i}`}>{options.find(o=>o.value===s)?.label??s}</span>)}
          <ChevronDown className="w-3 h-3 text-slate-400 ml-auto" data-test-id="multi-select-arrow" />
        </div>
        <div className="border border-slate-200 rounded-lg overflow-hidden" data-test-id="multi-select-options">
          {options.map((opt,i)=>(
            <div key={i} className={`px-3 py-1.5 text-xs flex items-center gap-2 cursor-pointer ${selected.includes(opt.value)?"bg-blue-50":"hover:bg-slate-50"}`} data-test-id={`multi-select-option-${i}`}>
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${selected.includes(opt.value)?"bg-blue-600 border-blue-600":"border-slate-300"}`} data-test-id={`multi-select-checkbox-${i}`}>
                {selected.includes(opt.value) && <Check className="w-2.5 h-2.5 text-white" data-test-id={`multi-select-check-${i}`} />}
              </div>
              <span className={selected.includes(opt.value)?"text-blue-700 font-medium":"text-slate-700"} data-test-id={`multi-select-option-label-${i}`}>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },

  "searchable-dropdown": (data) => {
    const label = (data.label as string) ?? "Select User";
    const placeholder = (data.placeholder as string) ?? "Search users...";
    const options = (data.options as {value:string;label:string}[]) ?? [{value:"alice",label:"Alice Johnson"},{value:"bob",label:"Bob Smith"},{value:"carol",label:"Carol White"},{value:"dave",label:"Dave Brown"}];
    return (
      <div className="flex flex-col h-full gap-2" data-test-id="searchable-dropdown-container">
        <label className="text-xs font-medium text-slate-700" data-test-id="searchable-dropdown-label">{label}</label>
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm" data-test-id="searchable-dropdown-panel">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100" data-test-id="searchable-dropdown-search-row">
            <Search className="w-3.5 h-3.5 text-slate-400" data-test-id="searchable-dropdown-search-icon" />
            <span className="text-xs text-slate-400" data-test-id="searchable-dropdown-search-input">{placeholder}</span>
          </div>
          {options.map((opt,i)=>(
            <div key={i} className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2" data-test-id={`searchable-dropdown-option-${i}`}>
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0" data-test-id={`searchable-dropdown-avatar-${i}`}>{opt.label[0]}</div>
              <span data-test-id={`searchable-dropdown-option-label-${i}`}>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },

  "date-range-picker": (data) => {
    const label = (data.label as string) ?? "Date Range";
    const from = (data.from as string) ?? "Mar 1, 2026";
    const to = (data.to as string) ?? "Mar 31, 2026";
    return (
      <div className="flex flex-col h-full gap-2" data-test-id="date-range-picker-container">
        <label className="text-xs font-medium text-slate-700" data-test-id="date-range-picker-label">{label}</label>
        <div className="flex items-center gap-2" data-test-id="date-range-picker-inputs">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg" data-test-id="date-range-picker-from">
            <Calendar className="w-3.5 h-3.5 text-slate-400" data-test-id="date-range-picker-from-icon" />
            <span className="text-xs text-slate-700" data-test-id="date-range-picker-from-value">{from}</span>
          </div>
          <span className="text-xs text-slate-400" data-test-id="date-range-picker-separator">→</span>
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg" data-test-id="date-range-picker-to">
            <Calendar className="w-3.5 h-3.5 text-slate-400" data-test-id="date-range-picker-to-icon" />
            <span className="text-xs text-slate-700" data-test-id="date-range-picker-to-value">{to}</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-xs text-center mt-1" data-test-id="date-range-picker-calendar">
          {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d,i)=><div key={i} className="py-0.5 text-slate-400 font-medium text-[10px]" data-test-id={`date-range-picker-dow-${i}`}>{d}</div>)}
          {[1,2,3,4,5,6,7].map((d,i)=><div key={i+7} className="py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]" data-test-id={`date-range-picker-day-${i}`}>{d}</div>)}
        </div>
      </div>
    );
  },

  // ── MENU ────────────────────────────────────────────────────────
  "sidebar-nav-menu": (data) => <SidebarNavWidget data={data} />,

  "breadcrumb-nav": (data) => {
    const items = (data.items as string[]) ?? ["Home","Dashboard","Analytics","Revenue"];
    return (
      <div className="flex flex-col h-full gap-2" data-test-id="breadcrumb-container">
        <div className="flex items-center gap-1 flex-wrap" data-test-id="breadcrumb-nav">
          {items.map((item,i)=>(
            <React.Fragment key={i}>
              <span className={`text-xs ${i===items.length-1?"font-semibold text-slate-800":"text-blue-600 hover:underline cursor-pointer"}`} data-test-id={`breadcrumb-item-${i}`}>{item}</span>
              {i<items.length-1 && <ChevronRight className="w-3 h-3 text-slate-400" data-test-id={`breadcrumb-sep-${i}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },

  "tab-bar": (data) => <TabBarWidget data={data} />,

  "command-palette": (data) => {
    const placeholder = (data.placeholder as string) ?? "Type a command or search...";
    const items = (data.items as {icon:string;label:string}[]) ?? [{icon:"Plus",label:"New Widget"},{icon:"Search",label:"Search Data"},{icon:"Settings",label:"Open Settings"},{icon:"LogOut",label:"Sign Out"}];
    const iconMap2: Record<string,React.ReactElement> = {Plus:<Plus className="w-3.5 h-3.5"/>,Search:<Search className="w-3.5 h-3.5"/>,Settings:<Star className="w-3.5 h-3.5"/>,LogOut:<ArrowUpRight className="w-3.5 h-3.5"/>};
    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm" data-test-id="command-palette-container">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100" data-test-id="command-palette-search-row">
          <Search className="w-4 h-4 text-slate-400" data-test-id="command-palette-search-icon" />
          <span className="text-sm text-slate-400 flex-1" data-test-id="command-palette-input">{placeholder}</span>
          <span className="text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded" data-test-id="command-palette-shortcut">⌘K</span>
        </div>
        {items.map((item,i)=>(
          <div key={i} className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer ${i===0?"bg-blue-50 text-blue-700":"text-slate-700 hover:bg-slate-50"}`} data-test-id={`command-palette-item-${i}`}>
            <span className={i===0?"text-blue-600":"text-slate-400"} data-test-id={`command-palette-item-icon-${i}`}>{iconMap2[item.icon]??<Star className="w-3.5 h-3.5"/>}</span>
            <span data-test-id={`command-palette-item-label-${i}`}>{item.label}</span>
            {i===0 && <span className="ml-auto text-[10px] border border-blue-200 text-blue-400 px-1 py-0.5 rounded" data-test-id="command-palette-item-enter">↵ Enter</span>}
          </div>
        ))}
      </div>
    );
  },

  // ── SEARCH ──────────────────────────────────────────────────────
  "search-variant-set": (data) => {
    const placeholders = (data.placeholders as Record<string, string>) ?? {
      basic: "Search anything...",
      filtered: "Search users...",
      global: "Search dashboards...",
    };
    const filters = (data.filters as string[]) ?? ["All", "Active", "Inactive"];
    console.log(`Debug flow: search-variant-set preview fired with`, { placeholders, filters });
    return (
      <div className="flex flex-col h-full justify-center gap-3" data-test-id="search-variant-set-container">
        <div className="space-y-0.5" data-test-id="search-variant-set-header">
          <p className="text-xs font-semibold text-slate-700">Search Variants</p>
          <p className="text-[11px] text-slate-500">Basic, filtered, and global styles</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3" data-test-id="search-variant-set-shell">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400" data-test-id="search-variant-set-basic">
            <Search className="w-3.5 h-3.5 text-slate-400" data-test-id="search-variant-set-basic-icon" />
            <span className="truncate" data-test-id="search-variant-set-basic-placeholder">{placeholders.basic}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5" data-test-id="search-variant-set-filters">
            {filters.map((filter, index) => (
              <span key={`${filter}-${index}`} className={`${index === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"} rounded-full px-2 py-1 text-[11px] font-medium`} data-test-id={`search-variant-set-filter-${index}`}>
                {filter}
              </span>
            ))}
          </div>
          <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2" data-test-id="search-variant-set-global">
            <p className="text-[10px] font-semibold uppercase text-slate-400" data-test-id="search-variant-set-global-label">Global</p>
            <p className="text-xs text-slate-500 truncate" data-test-id="search-variant-set-global-placeholder">{placeholders.global}</p>
          </div>
        </div>
      </div>
    );
  },

  "search-bar": (data) => {
    const placeholder = (data.placeholder as string) ?? "Search anything...";
    console.log(`Debug flow: search-bar preview fired with`, { placeholder });
    return (
      <div className="flex h-full items-center" data-test-id="search-bar-container">
        <div className="flex w-full min-w-0 items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg bg-white shadow-sm" data-test-id="search-bar-input-wrapper">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" data-test-id="search-bar-icon" />
          <Input
            type="text"
            placeholder={placeholder}
            className="h-auto border-0 bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 shadow-none focus-visible:ring-0"
            data-test-id="search-bar-input"
          />
        </div>
      </div>
    );
  },

  "search-with-filters": (data) => {
    const placeholder = (data.placeholder as string) ?? "Search users...";
    const filters = (data.filters as {label:string;active?:boolean}[]) ?? [{label:"All",active:true},{label:"Active"},{label:"Inactive"},{label:"Admin"}];
    return (
      <div className="flex flex-col h-full gap-2" data-test-id="search-filters-container">
        <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg" data-test-id="search-filters-input-row">
          <Search className="w-3.5 h-3.5 text-slate-400" data-test-id="search-filters-icon" />
          <Input
            type="text"
            placeholder={placeholder}
            className="h-auto border-0 bg-transparent p-0 text-xs text-slate-700 placeholder:text-slate-400 shadow-none focus-visible:ring-0"
            data-test-id="search-filters-input"
          />
          <Filter className="w-3.5 h-3.5 text-slate-400" data-test-id="search-filters-filter-icon" />
        </div>
        <div className="flex gap-1 flex-wrap" data-test-id="search-filters-chips">
          {filters.map((f,i)=>(
            <button key={i} className={`px-2.5 py-1 rounded-full text-xs font-medium ${f.active?"bg-blue-600 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`} data-test-id={`search-filters-chip-${i}`}>{f.label}</button>
          ))}
        </div>
        <div className="space-y-1" data-test-id="search-filters-results">
          {["Alice Johnson","Bob Smith","Carol White"].map((name,i)=>(
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer" data-test-id={`search-filters-result-${i}`}>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" data-test-id={`search-filters-avatar-${i}`}>{name[0]}</div>
              <span className="text-xs text-slate-700" data-test-id={`search-filters-result-name-${i}`}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },

  "global-search": (data) => {
    const placeholder = (data.placeholder as string) ?? "Search...";
    const cats = (data.categories as {label:string;count:number}[]) ?? [{label:"Pages",count:12},{label:"Users",count:48},{label:"Reports",count:7}];
    const recent = (data.recent as string[]) ?? ["Revenue report","User analytics","Q4 dashboard"];
    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden" data-test-id="global-search-container">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100" data-test-id="global-search-input-row">
          <Search className="w-4 h-4 text-slate-400" data-test-id="global-search-icon" />
          <Input
            type="text"
            placeholder={placeholder}
            className="h-auto border-0 bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 shadow-none focus-visible:ring-0"
            data-test-id="global-search-input"
          />
        </div>
        <div className="px-3 py-1.5" data-test-id="global-search-categories-section">
          <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1" data-test-id="global-search-categories-title">Browse</p>
          <div className="flex gap-1 flex-wrap" data-test-id="global-search-categories">
            {cats.map((cat,i)=><div key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-xs" data-test-id={`global-search-cat-${i}`}><span className="text-slate-600" data-test-id={`global-search-cat-label-${i}`}>{cat.label}</span><span className="text-slate-400 text-[10px]" data-test-id={`global-search-cat-count-${i}`}>{cat.count}</span></div>)}
          </div>
        </div>
        <div className="px-3 pb-2" data-test-id="global-search-recent-section">
          <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1" data-test-id="global-search-recent-title">Recent</p>
          {recent.map((item,i)=><div key={i} className="flex items-center gap-2 py-1 text-xs text-slate-600 cursor-pointer hover:text-slate-800" data-test-id={`global-search-recent-${i}`}><Clock className="w-3 h-3 text-slate-300" data-test-id={`global-search-recent-icon-${i}`} /><span data-test-id={`global-search-recent-label-${i}`}>{item}</span></div>)}
        </div>
      </div>
    );
  },

  // ── FORM ────────────────────────────────────────────────────────
  "text-input": (data) => {
    const label = (data.label as string) ?? "Full Name";
    const placeholder = (data.placeholder as string) ?? "Enter your full name";
    const helperText = (data.helperText as string) ?? "Used for display purposes";
    const required = (data.required as boolean) ?? true;
    return (
      <div className="flex flex-col h-full gap-1" data-test-id="text-input-container">
        <div className="flex items-center gap-1" data-test-id="text-input-label-row">
          <label className="text-xs font-medium text-slate-700" data-test-id="text-input-label">{label}</label>
          {required && <span className="text-red-500 text-xs" data-test-id="text-input-required">*</span>}
        </div>
        <div className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-400" data-test-id="text-input-input">{placeholder}</div>
        <p className="text-xs text-slate-400" data-test-id="text-input-helper">{helperText}</p>
      </div>
    );
  },

  "form-field-group": (data) => {
    const fields = (data.fields as {label:string;placeholder:string;type:string}[]) ?? [{label:"First Name",placeholder:"John",type:"text"},{label:"Last Name",placeholder:"Doe",type:"text"},{label:"Email",placeholder:"john@example.com",type:"email"},{label:"Role",placeholder:"Select role",type:"select"}];
    return (
      <div className="flex flex-col h-full gap-2" data-test-id="form-field-group-container">
        <div className="grid grid-cols-2 gap-2" data-test-id="form-field-group-grid">
          {fields.map((field,i)=>(
            <div key={i} className="space-y-1" data-test-id={`form-field-group-field-${i}`}>
              <label className="text-[10px] font-medium text-slate-600" data-test-id={`form-field-group-label-${i}`}>{field.label}</label>
              <div className={`px-2 py-1.5 border border-slate-200 rounded-md text-xs text-slate-400 flex items-center justify-between ${field.type==="select"?"bg-slate-50":""}`} data-test-id={`form-field-group-input-${i}`}>
                <span data-test-id={`form-field-group-placeholder-${i}`}>{field.placeholder}</span>
                {field.type==="select" && <ChevronDown className="w-3 h-3 text-slate-400" data-test-id={`form-field-group-arrow-${i}`} />}
              </div>
            </div>
          ))}
        </div>
        <button className="w-full py-2 bg-blue-600 text-white text-xs font-medium rounded-lg" data-test-id="form-field-group-submit">Submit Form</button>
      </div>
    );
  },

  "tag-input": (data) => {
    const label = (data.label as string) ?? "Tags";
    const tags = (data.tags as string[]) ?? ["Dashboard","Analytics","Revenue","Q4"];
    const placeholder = (data.placeholder as string) ?? "Add a tag...";
    const tagColors = ["bg-blue-50 text-blue-700","bg-emerald-50 text-emerald-700","bg-violet-50 text-violet-700","bg-orange-50 text-orange-700","bg-pink-50 text-pink-700"];
    return (
      <div className="flex flex-col h-full gap-2" data-test-id="tag-input-container">
        <label className="text-xs font-medium text-slate-700" data-test-id="tag-input-label">{label}</label>
        <div className="min-h-[40px] px-2 py-1.5 border border-slate-200 rounded-lg flex flex-wrap gap-1 items-center" data-test-id="tag-input-field">
          {tags.map((tag,i)=>(
            <div key={i} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tagColors[i%tagColors.length]}`} data-test-id={`tag-input-tag-${i}`}>
              <span data-test-id={`tag-input-tag-label-${i}`}>{tag}</span>
              <button className="hover:opacity-70 leading-none text-sm" data-test-id={`tag-input-tag-remove-${i}`}>×</button>
            </div>
          ))}
          <span className="text-xs text-slate-400 px-1" data-test-id="tag-input-placeholder">{placeholder}</span>
        </div>
        <div className="flex gap-1 flex-wrap" data-test-id="tag-input-suggestions">
          {["Reports","Finance","2026"].map((s,i)=><button key={i} className="px-2 py-0.5 border border-dashed border-slate-300 rounded-full text-xs text-slate-500 hover:border-slate-400" data-test-id={`tag-input-suggestion-${i}`}>+ {s}</button>)}
        </div>
      </div>
    );
  },

  "rating-widget": (data) => {
    const label = (data.label as string) ?? "Rate your experience";
    const value = (data.value as number) ?? 4;
    const max = (data.max as number) ?? 5;
    const labels = (data.labels as string[]) ?? ["Poor","Fair","Good","Very Good","Excellent"];
    return (
      <div className="flex flex-col h-full gap-3" data-test-id="rating-widget-container">
        <label className="text-xs font-medium text-slate-700" data-test-id="rating-widget-label">{label}</label>
        <div className="flex gap-1" data-test-id="rating-widget-stars">
          {[...Array(max)].map((_,i)=>(
            <button key={i} className={`transition-transform ${i<value?"text-yellow-400":"text-slate-200"}`} data-test-id={`rating-widget-star-${i}`}>
              <Star className="w-6 h-6 fill-current" data-test-id={`rating-widget-star-icon-${i}`} />
            </button>
          ))}
        </div>
        {labels[value-1] && <p className="text-sm font-semibold text-slate-700" data-test-id="rating-widget-selected-label">{labels[value-1]}</p>}
        <div className="flex gap-1" data-test-id="rating-widget-scale">
          {labels.map((lbl,i)=>(
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i<value?"bg-yellow-400":"bg-slate-200"}`} data-test-id={`rating-widget-scale-bar-${i}`} title={lbl} />
          ))}
        </div>
      </div>
    );
  },

  // ── RECHARTS-BASED CHARTS (For AI-generated widgets) ─────────
  "chart-bar": (data) => {
    const title = (data.title as string) ?? "Bar Chart";
    const xKey = (data.xKey as string) ?? "name";
    const chartData = (data.data as Record<string, unknown>[]) ?? [];
    const bars = (data.bars as Array<{dataKey: string; label: string; color: string}>) ?? [];

    if (!chartData.length || !bars.length) {
      return <div className="text-xs text-slate-400">No data</div>;
    }

    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between flex-shrink-0">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <BarChart3 className="w-4 h-4 text-violet-500" />
        </div>
        <div className="flex-1 min-h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 8, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} width={20} />
              <RechartsTooltip contentStyle={{ fontSize: 11, padding: "4px 8px" }} />
              {bars.map((bar) => (
                <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.label} fill={bar.color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  },

  "chart-line": (data) => {
    const title = (data.title as string) ?? "Line Chart";
    const xKey = (data.xKey as string) ?? "name";
    const chartData = (data.data as Record<string, unknown>[]) ?? [];
    const lines = (data.lines as Array<{dataKey: string; label: string; color: string}>) ?? [];

    if (!chartData.length || !lines.length) {
      return <div className="text-xs text-slate-400">No data</div>;
    }

    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-center justify-between flex-shrink-0">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex-1 min-h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={xKey} tick={{ fontSize: 8, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 8, fill: "#94a3b8" }} width={20} />
              <RechartsTooltip contentStyle={{ fontSize: 11, padding: "4px 8px" }} />
              {lines.map((line) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.label}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  },
};

function LivePreview({ slug, data }: { slug: string; data: PD }) {
  console.log(`Debug flow: LivePreview fired with`, { slug });
  const Preview = WIDGET_PREVIEWS[slug];
  if (!Preview) {
    return <div className="text-xs text-slate-400 text-center py-4">No preview available</div>;
  }
  return Preview(data);
}

interface WidgetCardProps {
  widget: WidgetTemplate;
  onCopy: (slug: string) => void;
  isCopied: boolean;
}

function WidgetCard({ widget, onCopy, isCopied }: WidgetCardProps) {
  console.log(`Debug flow: WidgetCard fired with`, { slug: widget.slug });
  const catColor = getCategoryColor(widget.category);
  const catLabel = getCategoryLabel(widget.category);

  return (
    <div
      className="group flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300 overflow-hidden"
      data-test-id={`widget-card-${widget.slug}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <Badge className={`${catColor} text-white text-xs px-2 py-0.5 font-medium`} data-test-id={`widget-badge-${widget.slug}`}>
          {catLabel}
        </Badge>
        <Button
          size="sm"
          variant={isCopied ? "default" : "ghost"}
          className={`h-7 text-xs gap-1 transition-all ${isCopied ? "bg-emerald-600 hover:bg-emerald-700" : "text-slate-500 hover:text-slate-700"}`}
          onClick={() => onCopy(widget.slug)}
          data-test-id={`widget-copy-btn-${widget.slug}`}
        >
          {isCopied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy ID</>}
        </Button>
      </div>

      {/* Title + description */}
      <div className="px-4 pb-3">
        <h3 className="text-sm font-semibold text-slate-900 leading-tight">{widget.title}</h3>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{widget.description}</p>
      </div>

      {/* Live preview — data driven from DB */}
      <div className="mx-3 mb-3 rounded-xl p-4 ring-1 ring-slate-200 bg-white flex-1">
        <LivePreview slug={widget.slug} data={widget.widgetData} />
      </div>

      {/* Footer */}
      <div className="px-4 pb-3">
        <code className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
          {widget.slug}
        </code>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="h-5 w-20 bg-slate-200 rounded-full" />
        <div className="h-7 w-20 bg-slate-100 rounded-md" />
      </div>
      <div className="px-4 pb-3"><div className="h-4 w-3/4 bg-slate-200 rounded" /><div className="h-3 w-1/2 bg-slate-100 rounded mt-1" /></div>
      <div className="mx-3 mb-3 rounded-xl bg-slate-100 h-32 flex-1" />
      <div className="px-4 pb-3"><div className="h-5 w-28 bg-slate-100 rounded" /></div>
    </div>
  );
}

export function WidgetsGallery() {
  console.log(`Debug flow: WidgetsGallery fired with`, { timestamp: new Date().toISOString() });

  const { selectedCategory, handleCategoryChange, copyWidgetId, widgets, loading, copiedId } = useWidgets();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Widget Gallery</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and add pre-built analytics widgets to your dashboard
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange("all")}
            data-test-id="widgets-category-all"
            className={`rounded-full text-xs font-medium ${selectedCategory === "all" ? "bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            All Widgets
            <span className="ml-1.5 text-xs opacity-60">{widgets.length}</span>
          </Button>
          {WIDGET_CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat.id as WidgetCategory)}
              data-test-id={`widgets-category-${cat.id}`}
              className={`rounded-full text-xs font-medium gap-1.5 ${selectedCategory === cat.id ? "bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}
            >
              <span className={`w-2 h-2 rounded-full ${cat.color}`} />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-700 font-semibold">No widgets found</p>
            <p className="text-slate-400 text-sm mt-1">Run <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">npx tsx prisma/seed-widgets.ts</code> to populate widgets</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {widgets.map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                onCopy={copyWidgetId}
                isCopied={copiedId === widget.slug}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
