"use client";

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DevTooltip } from "@/components/shared/DevTooltip";
import type {
  TextConfig,
  TableConfig,
  TableColumnConfig,
  AnalyticsCardsConfig,
  BarChartConfig,
  LineChartConfig,
  EditableInputConfig,
  FilterMenuConfig,
  ButtonConfig,
  InputConfig,
  BadgeConfig,
  CardConfig,
  SeparatorConfig,
  LabelConfig,
  TextareaConfig,
  CheckboxConfig,
  SwitchConfig,
  TooltipConfig,
  AvatarConfig,
  AccordionConfig,
  AlertConfig,
  AlertDialogConfig,
  AspectRatioConfig,
  BreadcrumbConfig,
  CalendarConfig,
  CarouselConfig,
  ChartConfig,
  CollapsibleConfig,
  ComboboxConfig,
  CommandConfig,
  ContextMenuConfig,
  DataTableConfig,
  DatePickerConfig,
  DialogConfig,
  DrawerConfig,
  DropdownMenuConfig,
  HoverCardConfig,
  InputGroupConfig,
  InputOTPConfig,
  KbdConfig,
  MenubarConfig,
  NavigationMenuConfig,
  PaginationConfig,
  PopoverConfig,
  ProgressConfig,
  RadioGroupConfig,
  ResizableConfig,
  ScrollAreaConfig,
  SelectConfig,
  SheetConfig,
  SidebarConfig,
  SkeletonConfig,
  SliderConfig,
  SonnerConfig,
  SpinnerConfig,
  TablePrimitiveConfig,
  TabsConfig,
  ToastConfig,
  ToggleConfig,
  ToggleGroupConfig,
  TypographyConfig,
  DivConfig,
  ParagraphConfig,
  HeadingConfig,
  SpanConfig,
  SectionConfig,
  HeaderElementConfig,
  FooterConfig,
  ArticleConfig,
  NavConfig,
  ListConfig,
  ImageConfig,
  ContainerConfig,
  PageComponentData,
} from "@/domain/admin/types";
import { EditableInput } from "@/components/ui/editable-input";
import { FilterMenu } from "@/components/ui/filter-menu";

// ─── Icon Helper ────────────────────────────────────────────
function DynamicIcon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ size?: number; className?: string }>
  >;
  const IconComp = icons[name];
  if (!IconComp) return null;
  return <IconComp size={size} className={className} />;
}

// ─── TextBlock ──────────────────────────────────────────────
function TextBlock({ config }: { config: TextConfig }) {
  if (config.variant === "heading") {
    return (
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--foreground)]">
        {config.content}
      </h2>
    );
  }
  if (config.variant === "code") {
    return (
      <pre className="rounded-lg bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-sm text-[var(--accent-cyan)]">
        {config.content}
      </pre>
    );
  }
  return (
    <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-[var(--foreground)] opacity-80">
      {config.content}
    </p>
  );
}

// ─── DataTable Cell Renderers ────────────────────────────────

function StatusCell({
  col,
  value,
  rowIndex,
}: {
  col: TableColumnConfig;
  value: string;
  rowIndex: number;
}) {
  const opts = col.statusOptions ?? [];
  const current = opts.find((o) => o.value === value);
  const variant = current?.variant ?? "secondary";

  if (opts.length === 0) {
    return (
      <Badge
        variant={variant}
        data-test-id={`admin-table-status-badge-${col.accessorKey}-${rowIndex}`}
      >
        {value}
      </Badge>
    );
  }

  return (
    <Select defaultValue={value}>
      <SelectTrigger
        data-test-id={`admin-table-status-select-${col.accessorKey}-${rowIndex}`}
        className="h-7 w-auto min-w-[100px] border-none bg-transparent px-2 text-xs font-medium shadow-none"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opts.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            data-test-id={`admin-table-status-option-${opt.value}-${rowIndex}`}
          >
            <Badge variant={opt.variant ?? "secondary"} className="pointer-events-none">
              {opt.label}
            </Badge>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ActionsCell({
  col,
  rowIndex,
}: {
  col: TableColumnConfig;
  rowIndex: number;
}) {
  const actions = col.actions ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-test-id={`admin-table-actions-btn-${rowIndex}`}
          className="h-7 w-7 text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <MoreHorizontal size={16} />
          <span className="sr-only">Row actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel
          data-test-id={`admin-table-actions-label-${rowIndex}`}
        >
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            data-test-id={`admin-table-action-${action.id}-${rowIndex}`}
            className={
              action.variant === "destructive"
                ? "text-destructive focus:text-destructive"
                : ""
            }
          >
            {action.icon && (
              <DynamicIcon name={action.icon} size={14} className="mr-2" />
            )}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── DataTable (TanStack) ───────────────────────────────────
function DataTable({ config }: { config: TableConfig }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      config.columns.map((col) => ({
        accessorKey: col.accessorKey,
        header: ({ column }) => (
          <Button
            variant="ghost"
            data-test-id={`admin-table-sort-${col.accessorKey}`}
            className="flex items-center gap-1 font-[family-name:var(--font-heading)] text-xs uppercase tracking-wider text-[var(--muted)] hover:text-[var(--accent-cyan)] transition-colors h-auto p-0"
            style={col.headerStyle}
            onClick={() =>
              col.sortable && column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            {col.header}
            {col.sortable && <ArrowUpDown size={12} />}
          </Button>
        ),
        cell: (info) => {
          const rowIndex = info.row.index;
          const rawValue = String(info.getValue() ?? "");

          if (col.columnType === "status") {
            return (
              <StatusCell col={col} value={rawValue} rowIndex={rowIndex} />
            );
          }

          if (col.columnType === "actions") {
            return <ActionsCell col={col} rowIndex={rowIndex} />;
          }

          return (
            <span
              data-test-id={`admin-table-cell-${col.accessorKey}-${rowIndex}`}
              className="font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
              style={col.cellStyle}
            >
              {rawValue}
            </span>
          );
        },
      })),
    [config.columns]
  );

  const table = useReactTable({
    data: config.data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: config.pagination?.enabled
      ? getPaginationRowModel()
      : undefined,
    initialState: {
      pagination: { pageSize: config.pagination?.pageSize ?? 10 },
    },
  });

  return (
    <div
      data-test-id="admin-table-container"
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
      style={config.containerStyle}
    >
      {(config.title || config.searchable) && (
        <div
          data-test-id="admin-table-toolbar"
          className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3"
        >
          {config.title && (
            <h3
              data-test-id="admin-table-title"
              className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--foreground)]"
            >
              {config.title}
            </h3>
          )}
          {config.searchable && (
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />
              <Input
                data-test-id="admin-table-search"
                type="text"
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="rounded-lg border-[var(--border)] bg-[var(--background)] py-1.5 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent-cyan)] transition-colors"
              />
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table data-test-id="admin-table" className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-[var(--border)]">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    data-test-id={`admin-table-header-${header.column.id}`}
                    className="px-4 py-3 text-left"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody data-test-id="admin-table-body">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                data-test-id={`admin-table-row-${row.index}`}
                className="border-b border-[var(--border)]/30 transition-colors hover:bg-[var(--accent-cyan)]/5"
                style={config.rowStyle}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    data-test-id={`admin-table-td-${cell.column.id}-${row.index}`}
                    className="px-4 py-2.5"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {config.pagination?.enabled && (
        <div
          data-test-id="admin-table-pagination"
          className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2"
        >
          <span data-test-id="admin-table-page-info" className="text-xs text-[var(--muted)]">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              data-test-id="admin-table-prev-page"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--accent-cyan)] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              data-test-id="admin-table-next-page"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--accent-cyan)] disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AnalyticsCards ─────────────────────────────────────────
function AnalyticsCards({ config }: { config: AnalyticsCardsConfig }) {
  const cols = config.columns ?? 4;
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)` }}
    >
      {config.cards.map((card, idx) => {
        const TrendIcon =
          card.trend === "up"
            ? TrendingUp
            : card.trend === "down"
              ? TrendingDown
              : Minus;
        const trendColor =
          card.trend === "up"
            ? "text-emerald-400"
            : card.trend === "down"
              ? "text-red-400"
              : "text-[var(--muted)]";

        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--accent-cyan)]/40"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cyan)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="font-[family-name:var(--font-heading)] text-xs uppercase tracking-wider text-[var(--muted)]">
                  {card.title}
                </span>
                {card.icon && (
                  <DynamicIcon
                    name={card.icon}
                    size={18}
                    className="text-[var(--accent-cyan)] opacity-60"
                  />
                )}
              </div>
              <div className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--foreground)]">
                {card.value}
              </div>
              {card.change && (
                <div className={`mt-2 flex items-center gap-1 text-xs ${trendColor}`}>
                  <TrendIcon size={14} />
                  <span>{card.change}</span>
                  {card.description && (
                    <span className="text-[var(--muted)] ml-1">
                      {card.description}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── BarChartBlock ──────────────────────────────────────────
function BarChartBlock({ config }: { config: BarChartConfig }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      {config.title && (
        <h3 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--foreground)]">
          {config.title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={config.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey={config.xKey}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            stroke="var(--border)"
          />
          <YAxis
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            stroke="var(--border)"
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted)" }} />
          {config.bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.label}
              fill={bar.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── LineChartBlock ─────────────────────────────────────────
function LineChartBlock({ config }: { config: LineChartConfig }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      {config.title && (
        <h3 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-[var(--foreground)]">
          {config.title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={config.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey={config.xKey}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            stroke="var(--border)"
          />
          <YAxis
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            stroke="var(--border)"
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted)" }} />
          {config.lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.label}
              stroke={line.color}
              strokeWidth={2}
              dot={{ fill: line.color, r: 3 }}
              activeDot={{ r: 5, fill: line.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Unknown Component Fallback ─────────────────────────────
function UnknownComponent({ type }: { type: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--accent-amber)]/40 bg-[var(--surface)] p-5 text-center">
      <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--accent-amber)]">
        Unknown component type: <code>{type}</code>
      </p>
    </div>
  );
}

// ─── EditableInputBlock ─────────────────────────────────────
function EditableInputBlock({ config }: { config: EditableInputConfig }) {
  const [value, setValue] = React.useState(config.value ?? "");
  return (
    <EditableInput
      value={value}
      onChange={setValue}
      label={config.label}
      placeholder={config.placeholder}
      disabled={config.disabled}
      testId={config.fieldKey ?? "editable"}
    />
  );
}

// ─── FilterMenuBlock ────────────────────────────────────────
function FilterMenuBlock({ config }: { config: FilterMenuConfig }) {
  const [filters, setFilters] = React.useState(config.filters ?? []);
  const handleChange = (id: string, checked: boolean) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, checked } : f))
    );
  };
  return (
    <FilterMenu
      label={config.label}
      filters={filters}
      onFilterChange={handleChange}
      testId="page-filter"
    />
  );
}

// ─── Dynamic Tailwind → Inline Style Converter ──────────────
// Tailwind JIT only generates CSS for classes found in source files.
// Classes from the DB (user-created via AI) have no generated CSS.
// This converter translates common Tailwind patterns to inline styles.
const TW_SHADES = [50,100,200,300,400,500,600,700,800,900,950] as const;
const TW_PALETTE: Record<string, string[]> = {
  slate:['#f8fafc','#f1f5f9','#e2e8f0','#cbd5e1','#94a3b8','#64748b','#475569','#334155','#1e293b','#0f172a','#020617'],
  gray:['#f9fafb','#f3f4f6','#e5e7eb','#d1d5db','#9ca3af','#6b7280','#4b5563','#374151','#1f2937','#111827','#030712'],
  zinc:['#fafafa','#f4f4f5','#e4e4e7','#d4d4d8','#a1a1aa','#71717a','#52525b','#3f3f46','#27272a','#18181b','#09090b'],
  neutral:['#fafafa','#f5f5f5','#e5e5e5','#d4d4d4','#a3a3a3','#737373','#525252','#404040','#262626','#171717','#0a0a0a'],
  stone:['#fafaf9','#f5f5f4','#e7e5e3','#d6d3d1','#a8a29e','#78716c','#57534e','#44403c','#292524','#1c1917','#0c0a09'],
  red:['#fef2f2','#fee2e2','#fecaca','#fca5a5','#f87171','#ef4444','#dc2626','#b91c1c','#991b1b','#7f1d1d','#450a0a'],
  orange:['#fff7ed','#ffedd5','#fed7aa','#fdba74','#fb923c','#f97316','#ea580c','#c2410c','#9a3412','#7c2d12','#431407'],
  amber:['#fffbeb','#fef3c7','#fde68a','#fcd34d','#fbbf24','#f59e0b','#d97706','#b45309','#92400e','#78350f','#451a03'],
  yellow:['#fefce8','#fef9c3','#fef08a','#fde047','#facc15','#eab308','#ca8a04','#a16207','#854d0e','#713f12','#422006'],
  lime:['#f7fee7','#ecfccb','#d9f99d','#bef264','#a3e635','#84cc16','#65a30d','#4d7c0f','#3f6212','#365314','#1a2e05'],
  green:['#f0fdf4','#dcfce7','#bbf7d0','#86efac','#4ade80','#22c55e','#16a34a','#15803d','#166534','#14532d','#052e16'],
  emerald:['#ecfdf5','#d1fae5','#a7f3d0','#6ee7b7','#34d399','#10b981','#059669','#047857','#065f46','#064e3b','#022c22'],
  teal:['#f0fdfa','#ccfbf1','#99f6e4','#5eead4','#2dd4bf','#14b8a6','#0d9488','#0f766e','#115e59','#134e4a','#042f2e'],
  cyan:['#ecfeff','#cffafe','#a5f3fc','#67e8f9','#22d3ee','#06b6d4','#0891b2','#0e7490','#155e75','#164e63','#083344'],
  sky:['#f0f9ff','#e0f2fe','#bae6fd','#7dd3fc','#38bdf8','#0ea5e9','#0284c7','#0369a1','#075985','#0c4a6e','#082f49'],
  blue:['#eff6ff','#dbeafe','#bfdbfe','#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8','#1e40af','#1e3a8a','#172554'],
  indigo:['#eef2ff','#e0e7ff','#c7d2fe','#a5b4fc','#818cf8','#6366f1','#4f46e5','#4338ca','#3730a3','#312e81','#1e1b4b'],
  violet:['#f5f3ff','#ede9fe','#ddd6fe','#c4b5fd','#a78bfa','#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95','#2e1065'],
  purple:['#faf5ff','#f3e8ff','#e9d5ff','#d8b4fe','#c084fc','#a855f7','#9333ea','#7e22ce','#6b21a8','#581c87','#3b0764'],
  fuchsia:['#fdf4ff','#fae8ff','#f5d0fe','#f0abfc','#e879f9','#d946ef','#c026d3','#a21caf','#86198f','#701a75','#4a044e'],
  pink:['#fdf2f8','#fce7f3','#fbcfe8','#f9a8d4','#f472b6','#ec4899','#db2777','#be185d','#9d174d','#831843','#500724'],
  rose:['#fff1f2','#ffe4e6','#fecdd3','#fda4af','#fb7185','#f43f5e','#e11d48','#be123c','#9f1239','#881337','#4c0519'],
};
function getTwColor(name: string, shade: string): string | undefined {
  const p = TW_PALETTE[name];
  if (!p) return undefined;
  const i = TW_SHADES.indexOf(Number(shade) as (typeof TW_SHADES)[number]);
  return i >= 0 ? p[i] : undefined;
}
const TW_SPACING: Record<string, string> = {
  '0':'0px','0.5':'0.125rem','1':'0.25rem','1.5':'0.375rem','2':'0.5rem',
  '2.5':'0.625rem','3':'0.75rem','3.5':'0.875rem','4':'1rem','5':'1.25rem',
  '6':'1.5rem','7':'1.75rem','8':'2rem','9':'2.25rem','10':'2.5rem',
  '11':'2.75rem','12':'3rem','14':'3.5rem','16':'4rem','20':'5rem',
  '24':'6rem','28':'7rem','32':'8rem','36':'9rem','40':'10rem',
  '44':'11rem','48':'12rem','52':'13rem','56':'14rem','60':'15rem',
  '64':'16rem','72':'18rem','80':'20rem','96':'24rem',
};
const TW_ROUND: Record<string, string> = {
  'none':'0px','sm':'0.125rem','':'0.25rem','md':'0.375rem','lg':'0.5rem',
  'xl':'0.75rem','2xl':'1rem','3xl':'1.5rem','full':'9999px',
};
const SPACING_PROP: Record<string, string | string[]> = {
  'h':'height','w':'width','min-h':'minHeight','min-w':'minWidth',
  'max-h':'maxHeight','max-w':'maxWidth','p':'padding',
  'px':['paddingLeft','paddingRight'],'py':['paddingTop','paddingBottom'],
  'pt':'paddingTop','pb':'paddingBottom','pl':'paddingLeft','pr':'paddingRight',
  'm':'margin','mx':['marginLeft','marginRight'],'my':['marginTop','marginBottom'],
  'mt':'marginTop','mb':'marginBottom','ml':'marginLeft','mr':'marginRight','gap':'gap',
};
const ARB_PROP: Record<string, string> = {
  ...Object.fromEntries(Object.entries(SPACING_PROP).filter(([,v]) => typeof v === 'string')) as Record<string, string>,
  'rounded':'borderRadius','text':'color','bg':'backgroundColor',
  'top':'top','right':'right','bottom':'bottom','left':'left','border':'borderWidth',
};
type SMap = Record<string, string | number>;
function setSpacing(prefix: string, value: string, s: SMap): boolean {
  const prop = SPACING_PROP[prefix];
  if (!prop) return false;
  if (Array.isArray(prop)) { for (const p of prop) s[p] = value; }
  else s[prop] = value;
  return true;
}
const FONT_SZ: Record<string, string> = {
  'text-xs':'0.75rem','text-sm':'0.875rem','text-base':'1rem','text-lg':'1.125rem',
  'text-xl':'1.25rem','text-2xl':'1.5rem','text-3xl':'1.875rem','text-4xl':'2.25rem',
  'text-5xl':'3rem','text-6xl':'3.75rem',
};
const FONT_WT: Record<string, string> = {
  'font-thin':'100','font-extralight':'200','font-light':'300','font-normal':'400',
  'font-medium':'500','font-semibold':'600','font-bold':'700','font-extrabold':'800','font-black':'900',
};
function convertTwToken(tok: string, s: SMap): boolean {
  let m: RegExpMatchArray | null;
  // Arbitrary values: prefix-[value]
  m = tok.match(/^([\w-]+)-\[(.+)\]$/);
  if (m) { const prop = ARB_PROP[m[1]]; if (prop) { s[prop] = m[2]; return true; }
    if (SPACING_PROP[m[1]]) return setSpacing(m[1], m[2], s); return false; }
  // bg-{color}-{shade}
  m = tok.match(/^bg-([\w]+)-(\d+)$/);
  if (m) { const c = getTwColor(m[1], m[2]); if (c) { s.backgroundColor = c; return true; } }
  if (tok === 'bg-white') { s.backgroundColor = '#fff'; return true; }
  if (tok === 'bg-black') { s.backgroundColor = '#000'; return true; }
  if (tok === 'bg-transparent') { s.backgroundColor = 'transparent'; return true; }
  // text-{color}-{shade}
  m = tok.match(/^text-([\w]+)-(\d+)$/);
  if (m) { const c = getTwColor(m[1], m[2]); if (c) { s.color = c; return true; } }
  if (tok === 'text-white') { s.color = '#fff'; return true; }
  if (tok === 'text-black') { s.color = '#000'; return true; }
  // border-{color}-{shade}
  m = tok.match(/^border-([\w]+)-(\d+)$/);
  if (m) { const c = getTwColor(m[1], m[2]); if (c) { s.borderColor = c; return true; } }
  // Spacing: h-N, w-N, p-N, m-N, etc.
  m = tok.match(/^(h|w|min-h|min-w|max-h|max-w|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-(.+)$/);
  if (m) { const v = TW_SPACING[m[2]]; if (v) return setSpacing(m[1], v, s);
    if (/^\d+$/.test(m[2])) return setSpacing(m[1], `${m[2]}px`, s); }
  // Size keywords
  if (tok === 'h-full') { s.height = '100%'; return true; }
  if (tok === 'w-full') { s.width = '100%'; return true; }
  if (tok === 'h-screen') { s.height = '100vh'; return true; }
  if (tok === 'w-screen') { s.width = '100vw'; return true; }
  if (tok === 'h-auto') { s.height = 'auto'; return true; }
  if (tok === 'w-auto') { s.width = 'auto'; return true; }
  // Rounded
  m = tok.match(/^rounded(?:-([\w]+))?$/);
  if (m) { const r = TW_ROUND[m[1] ?? '']; if (r) { s.borderRadius = r; return true; } }
  // Border width
  if (tok === 'border') { s.borderWidth = '1px'; s.borderStyle = 'solid'; return true; }
  m = tok.match(/^border-(\d+)$/);
  if (m) { s.borderWidth = `${m[1]}px`; s.borderStyle = 'solid'; return true; }
  // Opacity
  m = tok.match(/^opacity-(\d+)$/);
  if (m) { s.opacity = Number(m[1]) / 100; return true; }
  // Font size / weight
  if (FONT_SZ[tok]) { s.fontSize = FONT_SZ[tok]; return true; }
  if (FONT_WT[tok]) { s.fontWeight = FONT_WT[tok]; return true; }
  return false;
}
function parseDynamicStyles(className: string | undefined): { style: React.CSSProperties; classes: string } {
  if (!className) return { style: {}, classes: '' };
  const tokens = className.split(/\s+/).filter(Boolean);
  const s: SMap = {};
  const kept: string[] = [];
  for (const t of tokens) { if (!convertTwToken(t, s)) kept.push(t); }
  return { style: s as unknown as React.CSSProperties, classes: kept.join(' ') };
}

// ─── ContainerBlock (recursive children) ────────────────────
function ContainerBlock({
  config,
  childComponents,
  devMode,
}: {
  config: ContainerConfig;
  childComponents?: PageComponentData[];
  devMode?: boolean;
}) {
  const display = config.display ?? "flex";
  const direction = config.direction ?? "row";
  const gap = config.gap ?? 0;
  const gapClass = gap > 0 ? `gap-${gap}` : "";
  const wrapClass = config.wrap ? "flex-wrap" : "";
  const justifyMap: Record<string, string> = {
    start: "justify-start", center: "justify-center", end: "justify-end",
    between: "justify-between", around: "justify-around", evenly: "justify-evenly",
  };
  const alignMap: Record<string, string> = {
    start: "items-start", center: "items-center", end: "items-end",
    stretch: "items-stretch", baseline: "items-baseline",
  };
  const justifyClass = config.justify ? justifyMap[config.justify] ?? "" : "";
  const alignClass = config.align ? alignMap[config.align] ?? "" : "";

  const layoutClass = display === "grid"
    ? `grid ${gapClass}`
    : `flex ${direction === "column" ? "flex-col" : "flex-row"} ${gapClass} ${wrapClass} ${justifyClass} ${alignClass}`;
  const gridStyle = display === "grid"
    ? { gridTemplateColumns: `repeat(${config.columns ?? 2}, minmax(0, 1fr))` }
    : undefined;

  const sorted = childComponents ? [...childComponents].sort((a, b) => a.order - b.order) : [];

  const hasChildren = sorted.length > 0;
  const baseClass = hasChildren ? "" : "min-h-5";
  const { style: dynamicStyle, classes: dynamicClasses } = parseDynamicStyles(config.className);

  return (
    <div
      className={`${baseClass} ${layoutClass} ${dynamicClasses}`.trim()}
      style={{ ...gridStyle, ...dynamicStyle }}
      data-test-id="dynamic-container"
    >
      {sorted.map((child) => {
        const ChildRenderer = COMPONENT_REGISTRY[child.type];
        if (!ChildRenderer) return <UnknownComponent key={child.id} type={child.type} />;
        const isContainer = child.type === "container";
        return (
          <DevTooltip key={child.id} id={child.id} enabled={devMode ?? false} type={child.type}>
            <div className="animate-fade-in-up" data-component-id={child.id}>
              {isContainer ? (
                <ContainerBlock
                  config={child.config as unknown as ContainerConfig}
                  childComponents={child.children}
                  devMode={devMode}
                />
              ) : (
                <ChildRenderer config={child.config} />
              )}
            </div>
          </DevTooltip>
        );
      })}
    </div>
  );
}

// ─── UI Primitive Blocks ────────────────────────────────────
function ButtonBlock({ config }: { config: ButtonConfig }) {
  const IconComp = config.icon ? DynamicIcon : null;

  const collectValues = (): Record<string, string> => {
    const values: Record<string, string> = {};
    if (!config.collectInputIds?.length) return values;
    for (const inputId of config.collectInputIds) {
      const el = document.querySelector(`[data-component-id="${inputId}"] input, [data-component-id="${inputId}"] textarea`) as HTMLInputElement | HTMLTextAreaElement | null;
      if (el) values[inputId] = el.value;
    }
    return values;
  };

  const handleClick = () => {
    if (!config.onAction) return;
    const collected = collectValues();
    switch (config.onAction) {
      case "alert": {
        const msg = Object.keys(collected).length > 0
          ? `${config.alertMessage ?? config.label}\n\nValues:\n${Object.entries(collected).map(([k, v]) => `${k}: ${v}`).join("\n")}`
          : (config.alertMessage ?? config.label);
        window.alert(msg);
        break;
      }
      case "link":
        if (config.href) window.open(config.href, "_blank");
        break;
      case "custom":
        console.log("[OpenDash Button]", config.customId ?? config.label, collected);
        break;
      case "fetch":
        if (config.fetchUrl) {
          const opts: RequestInit = { method: config.fetchMethod ?? "GET" };
          if (Object.keys(collected).length > 0 && opts.method !== "GET") {
            opts.headers = { "Content-Type": "application/json" };
            opts.body = JSON.stringify(collected);
          }
          fetch(config.fetchUrl, opts)
            .then((r) => r.json())
            .then((data) => window.alert(JSON.stringify(data, null, 2)))
            .catch((err) => window.alert(`Fetch error: ${err.message}`));
        }
        break;
    }
  };

  return (
    <Button
      variant={config.variant}
      size={config.size}
      disabled={config.disabled}
      className={config.className}
      onClick={handleClick}
      data-test-id="dynamic-button"
    >
      {config.iconPosition === "left" && IconComp && (
        <IconComp name={config.icon!} size={16} className="mr-2" />
      )}
      {config.label}
      {config.iconPosition === "right" && IconComp && (
        <IconComp name={config.icon!} size={16} className="ml-2" />
      )}
    </Button>
  );
}

function InputBlock({ config }: { config: InputConfig }) {
  const id = React.useId();
  return (
    <div className="grid gap-2">
      {config.label && <Label htmlFor={id}>{config.label}</Label>}
      <Input
        id={id}
        type={config.type}
        placeholder={config.placeholder}
        defaultValue={config.value}
        disabled={config.disabled}
        required={config.required}
        className={config.className}
        data-test-id="dynamic-input"
      />
    </div>
  );
}

function BadgeBlock({ config }: { config: BadgeConfig }) {
  const { style: ds, classes: dc } = parseDynamicStyles(config.className);
  return (
    <Badge variant={config.variant} className={dc || undefined} style={ds} data-test-id="dynamic-badge">
      {config.text}
    </Badge>
  );
}

function CardBlock({ 
  config, 
  childComponents, 
  devMode 
}: { 
  config: CardConfig; 
  childComponents?: PageComponentData[]; 
  devMode?: boolean;
}) {
  const sorted = childComponents ? [...childComponents].sort((a, b) => a.order - b.order) : [];
  const hasChildren = sorted.length > 0;

  return (
    <Card className={config.className} data-test-id="dynamic-card">
      {(config.title || config.description) && (
        <CardHeader>
          {config.title && <CardTitle>{config.title}</CardTitle>}
          {config.description && <CardDescription>{config.description}</CardDescription>}
        </CardHeader>
      )}
      {(config.content || hasChildren) && (
        <CardContent>
          {config.content && typeof config.content === 'string' && config.content}
          {hasChildren && sorted.map((child) => {
            const ChildRenderer = COMPONENT_REGISTRY[child.type];
            if (!ChildRenderer) return <UnknownComponent key={child.id} type={child.type} />;
            const isContainer = child.type === "container";
            const isCard = child.type === "card";
            return (
              <DevTooltip key={child.id} id={child.id} enabled={devMode ?? false} type={child.type}>
                <div className="animate-fade-in-up" data-component-id={child.id}>
                  {isContainer ? (
                    <ContainerBlock
                      config={child.config as unknown as ContainerConfig}
                      childComponents={child.children}
                      devMode={devMode}
                    />
                  ) : isCard ? (
                    <CardBlock
                      config={child.config as unknown as CardConfig}
                      childComponents={child.children}
                      devMode={devMode}
                    />
                  ) : (
                    <ChildRenderer config={child.config} />
                  )}
                </div>
              </DevTooltip>
            );
          })}
        </CardContent>
      )}
      {config.footer && <CardFooter>{config.footer}</CardFooter>}
    </Card>
  );
}

function SeparatorBlock({ config }: { config: SeparatorConfig }) {
  return <Separator orientation={config.orientation} className={config.className} />;
}

function LabelBlock({ config }: { config: LabelConfig }) {
  return (
    <Label htmlFor={config.htmlFor} className={config.className}>
      {config.text}
      {config.required && <span className="text-destructive ml-1">*</span>}
    </Label>
  );
}

function TextareaBlock({ config }: { config: TextareaConfig }) {
  const id = React.useId();
  return (
    <div className="grid gap-2">
      {config.label && <Label htmlFor={id}>{config.label}</Label>}
      <Textarea
        id={id}
        placeholder={config.placeholder}
        defaultValue={config.value}
        disabled={config.disabled}
        rows={config.rows}
        className={config.className}
        data-test-id="dynamic-textarea"
      />
    </div>
  );
}

function CheckboxBlock({ config }: { config: CheckboxConfig }) {
  const id = React.useId();
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        defaultChecked={config.checked}
        disabled={config.disabled}
        className={config.className}
        data-test-id="dynamic-checkbox"
      />
      {config.label && <Label htmlFor={id}>{config.label}</Label>}
    </div>
  );
}

function SwitchBlock({ config }: { config: SwitchConfig }) {
  const id = React.useId();
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={id}
        defaultChecked={config.checked}
        disabled={config.disabled}
        className={config.className}
        data-test-id="dynamic-switch"
      />
      {config.label && <Label htmlFor={id}>{config.label}</Label>}
    </div>
  );
}

function TooltipBlock({ config }: { config: TooltipConfig }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{config.children}</TooltipTrigger>
        <TooltipContent side={config.side} className={config.className}>
          {config.content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AvatarBlock({ config }: { config: AvatarConfig }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };
  return (
    <Avatar className={`${sizeClasses[config.size ?? "md"]} ${config.className ?? ""}`}>
      {config.src && <AvatarImage src={config.src} alt={config.alt} />}
      <AvatarFallback>{config.fallback}</AvatarFallback>
    </Avatar>
  );
}

// ─── Additional Shadcn Component Blocks ────────────────────
function AccordionBlock({ config }: { config: AccordionConfig }) {
  return (
    <div className={config.className} data-test-id="dynamic-accordion">
      <p className="text-sm text-muted-foreground">Accordion: {config.items.length} items</p>
    </div>
  );
}

function AlertBlock({ config }: { config: AlertConfig }) {
  return (
    <div className={`rounded-lg border p-4 ${config.variant === "destructive" ? "border-destructive bg-destructive/10" : "border-border"} ${config.className}`} data-test-id="dynamic-alert">
      {config.title && <h5 className="mb-1 font-medium">{config.title}</h5>}
      <p className="text-sm">{config.description}</p>
    </div>
  );
}

function AlertDialogBlock({ config }: { config: AlertDialogConfig }) {
  return (
    <div className={config.className} data-test-id="dynamic-alert-dialog">
      <Button variant="outline">{config.triggerText || "Open Alert"}</Button>
    </div>
  );
}

function BreadcrumbBlock({ config }: { config: BreadcrumbConfig }) {
  return (
    <nav className={config.className} data-test-id="dynamic-breadcrumb">
      <ol className="flex items-center gap-2 text-sm">
        {config.items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
            {idx < config.items.length - 1 && <span className="text-muted-foreground">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function CalendarBlock({ config }: { config: CalendarConfig }) {
  return (
    <div className={config.className} data-test-id="dynamic-calendar">
      <p className="text-sm text-muted-foreground">Calendar ({config.mode || "single"} mode)</p>
    </div>
  );
}

function DialogBlock({ config }: { config: DialogConfig }) {
  return (
    <div className={config.className} data-test-id="dynamic-dialog">
      <Button variant="outline">{config.triggerText || "Open Dialog"}</Button>
    </div>
  );
}

function DropdownMenuBlock({ config }: { config: DropdownMenuConfig }) {
  return (
    <div className={config.className} data-test-id="dynamic-dropdown">
      <Button variant={config.triggerVariant || "outline"}>{config.triggerText}</Button>
    </div>
  );
}

function PaginationBlock({ config }: { config: PaginationConfig }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${config.className}`} data-test-id="dynamic-pagination">
      <Button variant="outline" size="sm" disabled>Previous</Button>
      <span className="text-sm">Page {config.currentPage || 1} of {Math.ceil(config.total / (config.pageSize || 10))}</span>
      <Button variant="outline" size="sm">Next</Button>
    </div>
  );
}

function PopoverBlock({ config }: { config: PopoverConfig }) {
  return (
    <div className={config.className} data-test-id="dynamic-popover">
      <Button variant="outline">{config.trigger}</Button>
    </div>
  );
}

function RadioGroupBlock({ config }: { config: RadioGroupConfig }) {
  return (
    <div className={`grid gap-2 ${config.className}`} data-test-id="dynamic-radio-group">
      {config.items.map((item) => (
        <div key={item.value} className="flex items-center space-x-2">
          <input type="radio" id={item.value} name="radio-group" value={item.value} defaultChecked={item.value === config.defaultValue} disabled={config.disabled} />
          <Label htmlFor={item.value}>{item.label}</Label>
        </div>
      ))}
    </div>
  );
}

function ScrollAreaBlock({ config }: { config: ScrollAreaConfig }) {
  return (
    <div className={config.className} style={{ height: config.height || "200px", overflow: "auto" }} data-test-id="dynamic-scroll-area">
      <div className="p-4">{config.content}</div>
    </div>
  );
}

function SelectBlock({ config }: { config: SelectConfig }) {
  const id = React.useId();
  return (
    <div className="grid gap-2">
      <select id={id} defaultValue={config.defaultValue} disabled={config.disabled} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${config.className}`} data-test-id="dynamic-select">
        {config.placeholder && <option value="">{config.placeholder}</option>}
        {config.items.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </div>
  );
}

function TabsBlock({ config }: { config: TabsConfig }) {
  return (
    <div className={config.className} data-test-id="dynamic-tabs">
      <div className="flex gap-2 border-b">
        {config.tabs.map((tab) => (
          <button key={tab.value} className="px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:border-primary">
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        {config.tabs.find(t => t.value === config.defaultValue)?.content || config.tabs[0]?.content}
      </div>
    </div>
  );
}

function TablePrimitiveBlock({ config }: { config: TablePrimitiveConfig }) {
  return (
    <div className={config.className} data-test-id="dynamic-table-primitive">
      <table className="w-full border-collapse">
        {config.caption && <caption className="text-sm text-muted-foreground mb-2">{config.caption}</caption>}
        <thead>
          <tr className="border-b">
            {config.headers.map((header, idx) => (
              <th key={idx} className="p-2 text-left font-medium">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {config.rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="p-2">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TypographyBlock({ config }: { config: TypographyConfig }) {
  const { style: ds, classes: dc } = parseDynamicStyles(config.className);
  const variants = {
    h1: <h1 className={dc || undefined} style={ds}>{config.text}</h1>,
    h2: <h2 className={dc || undefined} style={ds}>{config.text}</h2>,
    h3: <h3 className={dc || undefined} style={ds}>{config.text}</h3>,
    h4: <h4 className={dc || undefined} style={ds}>{config.text}</h4>,
    p: <p className={dc || undefined} style={ds}>{config.text}</p>,
    blockquote: <blockquote className={`border-l-4 pl-4 italic ${dc}`.trim()} style={ds}>{config.text}</blockquote>,
    code: <code className={`rounded bg-muted px-1 py-0.5 font-mono text-sm ${dc}`.trim()} style={ds}>{config.text}</code>,
    lead: <p className={`text-xl text-muted-foreground ${dc}`.trim()} style={ds}>{config.text}</p>,
    large: <div className={`text-lg font-semibold ${dc}`.trim()} style={ds}>{config.text}</div>,
    small: <small className={`text-sm font-medium ${dc}`.trim()} style={ds}>{config.text}</small>,
    muted: <p className={`text-sm text-muted-foreground ${dc}`.trim()} style={ds}>{config.text}</p>,
  };
  return <div data-test-id="dynamic-typography">{variants[config.variant]}</div>;
}

function ProgressBlock({ config }: { config: ProgressConfig }) {
  const percentage = ((config.value / (config.max || 100)) * 100).toFixed(0);
  return (
    <div className={config.className} data-test-id="dynamic-progress">
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
      </div>
      {config.showLabel && <p className="text-sm text-muted-foreground mt-1">{percentage}%</p>}
    </div>
  );
}

function SkeletonBlock({ config }: { config: SkeletonConfig }) {
  const count = config.count || 1;
  return (
    <div className={config.className} data-test-id="dynamic-skeleton">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="animate-pulse bg-muted rounded" style={{ width: config.width || "100%", height: config.height || "20px", marginBottom: idx < count - 1 ? "8px" : "0" }} />
      ))}
    </div>
  );
}

function SliderBlock({ config }: { config: SliderConfig }) {
  return (
    <div className={config.className} data-test-id="dynamic-slider">
      <input type="range" min={config.min || 0} max={config.max || 100} step={config.step || 1} defaultValue={Array.isArray(config.defaultValue) ? config.defaultValue[0] : config.defaultValue} disabled={config.disabled} className="w-full" />
    </div>
  );
}

function SonnerBlock({ config }: { config: SonnerConfig }) {
  return (
    <div className={config.className} data-test-id="dynamic-sonner">
      <Button variant="outline" onClick={() => {
        if (typeof window !== 'undefined') {
          const toast = (window as typeof window & { toast?: { [key: string]: (message: string, options?: { description?: string }) => void } }).toast;
          if (toast && config.type && toast[config.type]) {
            toast[config.type](config.message, { description: config.description });
          } else if (toast && toast.default) {
            toast.default(config.message, { description: config.description });
          }
        }
      }}>
        Show Toast
      </Button>
    </div>
  );
}

function SpinnerBlock({ config }: { config: SpinnerConfig }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <div className={config.className} data-test-id="dynamic-spinner">
      <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizes[config.size || "md"]}`} />
    </div>
  );
}

function ToggleBlock({ config }: { config: ToggleConfig }) {
  return (
    <Button variant={config.variant || "outline"} size={config.size} disabled={config.disabled} className={config.className} data-test-id="dynamic-toggle">
      {config.icon && <DynamicIcon name={config.icon} size={16} className="mr-2" />}
      {config.label}
    </Button>
  );
}

function PlaceholderBlock({ type }: { type: string; config: Record<string, unknown> }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 text-center" data-test-id={`dynamic-${type}-placeholder`}>
      <p className="text-sm font-medium text-muted-foreground">
        Component: <code className="font-mono">{type}</code>
      </p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        Install with: <code className="font-mono">npx shadcn@latest add {type}</code>
      </p>
    </div>
  );
}

// ─── HTML Element Blocks ────────────────────────────────────
function DivBlock({ config }: { config: DivConfig }) {
  const { style: dynStyle, classes: dynClasses } = parseDynamicStyles(config.className);
  const mergedStyle = { ...dynStyle, ...config.style };
  if (config.html) {
    return (
      <div className={dynClasses || undefined} style={mergedStyle} data-test-id="dynamic-div" dangerouslySetInnerHTML={{ __html: config.html }} />
    );
  }
  return (
    <div className={dynClasses || undefined} style={mergedStyle} data-test-id="dynamic-div">
      {config.children}
    </div>
  );
}

function ParagraphBlock({ config }: { config: ParagraphConfig }) {
  if (config.html) {
    return (
      <p className={config.className} data-test-id="dynamic-p" dangerouslySetInnerHTML={{ __html: config.html }} />
    );
  }
  return (
    <p className={config.className} data-test-id="dynamic-p">
      {config.text}
    </p>
  );
}

function HeadingBlock({ config }: { config: HeadingConfig }) {
  const headings = {
    1: (props: { className?: string; children?: React.ReactNode; dangerouslySetInnerHTML?: { __html: string } }) => <h1 {...props} />,
    2: (props: { className?: string; children?: React.ReactNode; dangerouslySetInnerHTML?: { __html: string } }) => <h2 {...props} />,
    3: (props: { className?: string; children?: React.ReactNode; dangerouslySetInnerHTML?: { __html: string } }) => <h3 {...props} />,
    4: (props: { className?: string; children?: React.ReactNode; dangerouslySetInnerHTML?: { __html: string } }) => <h4 {...props} />,
    5: (props: { className?: string; children?: React.ReactNode; dangerouslySetInnerHTML?: { __html: string } }) => <h5 {...props} />,
    6: (props: { className?: string; children?: React.ReactNode; dangerouslySetInnerHTML?: { __html: string } }) => <h6 {...props} />,
  };
  const Tag = headings[config.level];
  if (config.html) {
    return (
      <Tag className={config.className} data-test-id={`dynamic-h${config.level}`} dangerouslySetInnerHTML={{ __html: config.html }} />
    );
  }
  return (
    <Tag className={config.className} data-test-id={`dynamic-h${config.level}`}>
      {config.text}
    </Tag>
  );
}

function SpanBlock({ config }: { config: SpanConfig }) {
  return (
    <span className={config.className} data-test-id="dynamic-span">
      {config.text}
    </span>
  );
}

function SectionBlock({ config }: { config: SectionConfig }) {
  if (config.html) {
    return (
      <section className={config.className} data-test-id="dynamic-section" dangerouslySetInnerHTML={{ __html: config.html }} />
    );
  }
  return (
    <section className={config.className} data-test-id="dynamic-section">
      {config.children}
    </section>
  );
}

function HeaderElementBlock({ config }: { config: HeaderElementConfig }) {
  return (
    <header className={config.className} data-test-id="dynamic-header">
      {config.children}
    </header>
  );
}

function FooterBlock({ config }: { config: FooterConfig }) {
  return (
    <footer className={config.className} data-test-id="dynamic-footer">
      {config.children}
    </footer>
  );
}

function ArticleBlock({ config }: { config: ArticleConfig }) {
  return (
    <article className={config.className} data-test-id="dynamic-article">
      {config.children}
    </article>
  );
}

function NavBlock({ config }: { config: NavConfig }) {
  return (
    <nav className={config.className} data-test-id="dynamic-nav">
      {config.children}
    </nav>
  );
}

function ListBlock({ config }: { config: ListConfig }) {
  const Tag = config.ordered ? "ol" : "ul";
  return (
    <Tag className={config.className} data-test-id={`dynamic-${config.ordered ? "ol" : "ul"}`}>
      {config.items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </Tag>
  );
}

function ImageBlock({ config }: { config: ImageConfig }) {
  return (
    <img
      src={config.src}
      alt={config.alt}
      width={config.width}
      height={config.height}
      className={config.className}
      data-test-id="dynamic-img"
    />
  );
}

// ─── Component Registry ─────────────────────────────────────
type RendererFn = (props: { config: Record<string, unknown> }) => React.ReactNode;

const COMPONENT_REGISTRY: Record<string, RendererFn> = {
  // Core Components
  text: ({ config }) => <TextBlock config={config as unknown as TextConfig} />,
  table: ({ config }) => <DataTable config={config as unknown as TableConfig} />,
  "analytics-cards": ({ config }) => <AnalyticsCards config={config as unknown as AnalyticsCardsConfig} />,
  "chart-bar": ({ config }) => <BarChartBlock config={config as unknown as BarChartConfig} />,
  "chart-line": ({ config }) => <LineChartBlock config={config as unknown as LineChartConfig} />,
  "editable-input": ({ config }) => <EditableInputBlock config={config as unknown as EditableInputConfig} />,
  "filter-menu": ({ config }) => <FilterMenuBlock config={config as unknown as FilterMenuConfig} />,
  
  // Container (parent with children)
  container: ({ config }) => <ContainerBlock config={config as unknown as ContainerConfig} />,
  
  // UI Primitives (Installed)
  button: ({ config }) => <ButtonBlock config={config as unknown as ButtonConfig} />,
  input: ({ config }) => <InputBlock config={config as unknown as InputConfig} />,
  badge: ({ config }) => <BadgeBlock config={config as unknown as BadgeConfig} />,
  card: ({ config }) => <CardBlock config={config as unknown as CardConfig} />,
  separator: ({ config }) => <SeparatorBlock config={config as unknown as SeparatorConfig} />,
  label: ({ config }) => <LabelBlock config={config as unknown as LabelConfig} />,
  textarea: ({ config }) => <TextareaBlock config={config as unknown as TextareaConfig} />,
  checkbox: ({ config }) => <CheckboxBlock config={config as unknown as CheckboxConfig} />,
  switch: ({ config }) => <SwitchBlock config={config as unknown as SwitchConfig} />,
  tooltip: ({ config }) => <TooltipBlock config={config as unknown as TooltipConfig} />,
  avatar: ({ config }) => <AvatarBlock config={config as unknown as AvatarConfig} />,
  
  // Shadcn Components (Installed + Renderers)
  accordion: ({ config }) => <AccordionBlock config={config as unknown as AccordionConfig} />,
  alert: ({ config }) => <AlertBlock config={config as unknown as AlertConfig} />,
  "alert-dialog": ({ config }) => <AlertDialogBlock config={config as unknown as AlertDialogConfig} />,
  breadcrumb: ({ config }) => <BreadcrumbBlock config={config as unknown as BreadcrumbConfig} />,
  calendar: ({ config }) => <CalendarBlock config={config as unknown as CalendarConfig} />,
  dialog: ({ config }) => <DialogBlock config={config as unknown as DialogConfig} />,
  "dropdown-menu": ({ config }) => <DropdownMenuBlock config={config as unknown as DropdownMenuConfig} />,
  pagination: ({ config }) => <PaginationBlock config={config as unknown as PaginationConfig} />,
  popover: ({ config }) => <PopoverBlock config={config as unknown as PopoverConfig} />,
  "radio-group": ({ config }) => <RadioGroupBlock config={config as unknown as RadioGroupConfig} />,
  "scroll-area": ({ config }) => <ScrollAreaBlock config={config as unknown as ScrollAreaConfig} />,
  select: ({ config }) => <SelectBlock config={config as unknown as SelectConfig} />,
  tabs: ({ config }) => <TabsBlock config={config as unknown as TabsConfig} />,
  "table-primitive": ({ config }) => <TablePrimitiveBlock config={config as unknown as TablePrimitiveConfig} />,
  typography: ({ config }) => <TypographyBlock config={config as unknown as TypographyConfig} />,
  progress: ({ config }) => <ProgressBlock config={config as unknown as ProgressConfig} />,
  skeleton: ({ config }) => <SkeletonBlock config={config as unknown as SkeletonConfig} />,
  slider: ({ config }) => <SliderBlock config={config as unknown as SliderConfig} />,
  sonner: ({ config }) => <SonnerBlock config={config as unknown as SonnerConfig} />,
  spinner: ({ config }) => <SpinnerBlock config={config as unknown as SpinnerConfig} />,
  toggle: ({ config }) => <ToggleBlock config={config as unknown as ToggleConfig} />,
  
  // Shadcn Components (Placeholders for not-yet-installed)
  "aspect-ratio": ({ config }) => <PlaceholderBlock type="aspect-ratio" config={config} />,
  carousel: ({ config }) => <PlaceholderBlock type="carousel" config={config} />,
  chart: ({ config }) => <PlaceholderBlock type="chart" config={config} />,
  collapsible: ({ config }) => <PlaceholderBlock type="collapsible" config={config} />,
  combobox: ({ config }) => <PlaceholderBlock type="combobox" config={config} />,
  command: ({ config }) => <PlaceholderBlock type="command" config={config} />,
  "context-menu": ({ config }) => <PlaceholderBlock type="context-menu" config={config} />,
  "data-table": ({ config }) => <PlaceholderBlock type="data-table" config={config} />,
  "date-picker": ({ config }) => <PlaceholderBlock type="date-picker" config={config} />,
  drawer: ({ config }) => <PlaceholderBlock type="drawer" config={config} />,
  empty: ({ config }) => <PlaceholderBlock type="empty" config={config} />,
  field: ({ config }) => <PlaceholderBlock type="field" config={config} />,
  "hover-card": ({ config }) => <PlaceholderBlock type="hover-card" config={config} />,
  "input-group": ({ config }) => <PlaceholderBlock type="input-group" config={config} />,
  "input-otp": ({ config }) => <PlaceholderBlock type="input-otp" config={config} />,
  item: ({ config }) => <PlaceholderBlock type="item" config={config} />,
  kbd: ({ config }) => <PlaceholderBlock type="kbd" config={config} />,
  menubar: ({ config }) => <PlaceholderBlock type="menubar" config={config} />,
  "native-select": ({ config }) => <PlaceholderBlock type="native-select" config={config} />,
  "navigation-menu": ({ config }) => <PlaceholderBlock type="navigation-menu" config={config} />,
  resizable: ({ config }) => <PlaceholderBlock type="resizable" config={config} />,
  sheet: ({ config }) => <PlaceholderBlock type="sheet" config={config} />,
  sidebar: ({ config }) => <PlaceholderBlock type="sidebar" config={config} />,
  toast: ({ config }) => <PlaceholderBlock type="toast" config={config} />,
  "toggle-group": ({ config }) => <PlaceholderBlock type="toggle-group" config={config} />,
  
  // HTML Elements
  div: ({ config }) => <DivBlock config={config as unknown as DivConfig} />,
  p: ({ config }) => <ParagraphBlock config={config as unknown as ParagraphConfig} />,
  h1: ({ config }) => <HeadingBlock config={{ ...config as unknown as HeadingConfig, level: 1 }} />,
  h2: ({ config }) => <HeadingBlock config={{ ...config as unknown as HeadingConfig, level: 2 }} />,
  h3: ({ config }) => <HeadingBlock config={{ ...config as unknown as HeadingConfig, level: 3 }} />,
  h4: ({ config }) => <HeadingBlock config={{ ...config as unknown as HeadingConfig, level: 4 }} />,
  h5: ({ config }) => <HeadingBlock config={{ ...config as unknown as HeadingConfig, level: 5 }} />,
  h6: ({ config }) => <HeadingBlock config={{ ...config as unknown as HeadingConfig, level: 6 }} />,
  heading: ({ config }) => <HeadingBlock config={config as unknown as HeadingConfig} />,
  span: ({ config }) => <SpanBlock config={config as unknown as SpanConfig} />,
  section: ({ config }) => <SectionBlock config={config as unknown as SectionConfig} />,
  header: ({ config }) => <HeaderElementBlock config={config as unknown as HeaderElementConfig} />,
  footer: ({ config }) => <FooterBlock config={config as unknown as FooterConfig} />,
  article: ({ config }) => <ArticleBlock config={config as unknown as ArticleConfig} />,
  nav: ({ config }) => <NavBlock config={config as unknown as NavConfig} />,
  ul: ({ config }) => <ListBlock config={{ ...config as unknown as ListConfig, ordered: false }} />,
  ol: ({ config }) => <ListBlock config={{ ...config as unknown as ListConfig, ordered: true }} />,
  list: ({ config }) => <ListBlock config={config as unknown as ListConfig} />,
  img: ({ config }) => <ImageBlock config={config as unknown as ImageConfig} />,
};

// ─── PageRenderer (exported) ────────────────────────────────
export function PageRenderer({
  components,
  devMode = false,
}: {
  components: PageComponentData[];
  devMode?: boolean;
}) {
  if (components.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="font-[family-name:var(--font-heading)] text-lg text-[var(--muted)]">
            No components yet
          </p>
          <p className="mt-1 text-sm text-[var(--muted)] opacity-60">
            Open the AI chat and describe what you want to build
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {[...components]
        .sort((a, b) => a.order - b.order)
        .map((comp) => {
          const Renderer = COMPONENT_REGISTRY[comp.type];
          if (!Renderer) {
            return <UnknownComponent key={comp.id} type={comp.type} />;
          }
          const isContainer = comp.type === "container";
          const isCard = comp.type === "card";
          return (
            <DevTooltip key={comp.id} id={comp.id} enabled={devMode} type={comp.type}>
              <div className="animate-fade-in-up" data-component-id={comp.id}>
                {isContainer ? (
                  <ContainerBlock
                    config={comp.config as unknown as ContainerConfig}
                    childComponents={comp.children}
                    devMode={devMode}
                  />
                ) : isCard ? (
                  <CardBlock
                    config={comp.config as unknown as CardConfig}
                    childComponents={comp.children}
                    devMode={devMode}
                  />
                ) : (
                  <Renderer config={comp.config} />
                )}
              </div>
            </DevTooltip>
          );
        })}
    </div>
  );
}

export { DynamicIcon };
