"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type Table,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type {
  OrderRow,
  OrdersTableCellContext,
  OrdersTableColumnHelpers,
  SortableHeaderContext,
  TableFeatureConfig,
  TableWidgetConfig,
} from "@/domain/widgets/types";

export const DEFAULT_ORDER_ROWS: OrderRow[] = [
  { id: "ORD-001", customer: "Alice Johnson", amount: "$129.00", status: "Completed" },
  { id: "ORD-002", customer: "Bob Smith", amount: "$64.50", status: "Pending" },
  { id: "ORD-003", customer: "Carol White", amount: "$512.00", status: "Failed" },
  { id: "ORD-004", customer: "Dave Brown", amount: "$89.99", status: "Completed" },
];

export function buildOrdersTableFeatures(
  preview: boolean,
  config: TableWidgetConfig,
  rawConfig: TableWidgetConfig & Record<string, unknown>
): {
  features: TableFeatureConfig;
  featureOverrides: TableFeatureConfig;
  requestedPageSize: number | undefined;
} {
  const featureOverrides: TableFeatureConfig = {
    sorting: typeof rawConfig.sorting === "boolean" ? rawConfig.sorting : undefined,
    filtering: typeof rawConfig.filtering === "boolean" ? rawConfig.filtering : undefined,
    pagination: typeof rawConfig.pagination === "boolean" ? rawConfig.pagination : undefined,
    columnVisibility: typeof rawConfig.columnVisibility === "boolean" ? rawConfig.columnVisibility : undefined,
    columnResizing: typeof rawConfig.columnResizing === "boolean" ? rawConfig.columnResizing : undefined,
    rowSelection: typeof rawConfig.rowSelection === "boolean" ? rawConfig.rowSelection : undefined,
    expandableRows: typeof rawConfig.expandableRows === "boolean" ? rawConfig.expandableRows : undefined,
  };

  const features: TableFeatureConfig = preview
    ? {
        sorting: false,
        filtering: false,
        pagination: false,
        columnVisibility: false,
        columnResizing: false,
        rowSelection: false,
        expandableRows: false,
      }
    : {
        sorting: featureOverrides.sorting ?? config.features?.sorting ?? true,
        filtering: featureOverrides.filtering ?? config.features?.filtering ?? true,
        pagination: featureOverrides.pagination ?? config.features?.pagination ?? true,
        columnVisibility: featureOverrides.columnVisibility ?? config.features?.columnVisibility ?? true,
        columnResizing: featureOverrides.columnResizing ?? config.features?.columnResizing ?? true,
        rowSelection: featureOverrides.rowSelection ?? config.features?.rowSelection ?? true,
        expandableRows: featureOverrides.expandableRows ?? config.features?.expandableRows ?? false,
      };

  const requestedPageSize =
    typeof config.pageSize === "number"
      ? config.pageSize
      : typeof rawConfig.rowsPerPage === "number"
        ? rawConfig.rowsPerPage
        : undefined;

  console.log(`Debug flow: buildOrdersTableFeatures fired with`, {
    preview,
    featureOverrides,
    features,
    requestedPageSize,
  });

  return { features, featureOverrides, requestedPageSize };
}

export function buildOrdersTableControlledState(
  features: TableFeatureConfig,
  helpers: OrdersTableColumnHelpers,
  pagination: { pageIndex: number; pageSize: number }
) {
  console.log(`Debug flow: buildOrdersTableControlledState fired with`, {
    features,
    sortingCount: helpers.sorting.value.length,
    filteringCount: Object.keys(helpers.filtering.value).length,
    selectionCount: Object.keys(helpers.rowSelection.value).length,
    pagination,
  });

  return {
    ...(features.sorting ? { sorting: helpers.sorting.value } : {}),
    ...(features.filtering
      ? { columnFilters: Object.entries(helpers.filtering.value).map(([id, value]) => ({ id, value })) }
      : {}),
    ...(features.pagination ? { pagination } : {}),
    ...(features.rowSelection ? { rowSelection: helpers.rowSelection.value } : {}),
  };
}

export function buildOrdersTableColumns(
  features: TableFeatureConfig,
  helpers: OrdersTableColumnHelpers
): ColumnDef<OrderRow>[] {
  const statusColor: Record<string, string> = {
    Completed: "text-emerald-700 bg-emerald-50",
    Pending: "text-yellow-700 bg-yellow-50",
    Failed: "text-red-700 bg-red-50",
  };

  console.log(`Debug flow: buildOrdersTableColumns fired with`, { features });

  return [
    ...(features.rowSelection
      ? [
          {
            id: "select",
            header: ({ table }: { table: Table<OrderRow> }) => (
              <input
                type="checkbox"
                checked={table.getIsAllRowsSelected()}
                onChange={(e) => {
                  table.toggleAllRowsSelected(e.target.checked);
                  if (e.target.checked) {
                    helpers.rowSelection.selectAll(table.getRowModel().rows.map((row) => row.id));
                  } else {
                    helpers.rowSelection.clear();
                  }
                }}
                className="cursor-pointer"
                data-test-id="orders-table-select-all"
              />
            ),
            cell: ({ row }: { row: { id: string; getIsSelected: () => boolean; toggleSelected: (value?: boolean) => void } }) => (
              <input
                type="checkbox"
                checked={row.getIsSelected()}
                onChange={(e) => {
                  row.toggleSelected(e.target.checked);
                  helpers.rowSelection.toggle(row.id);
                }}
                className="cursor-pointer"
                data-test-id={`orders-table-row-select-${row.id}`}
              />
            ),
            size: 40,
          },
        ]
      : []),
    {
      accessorKey: "id",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="orders-table-sort-id"
        >
          Order
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Order",
      cell: (item: OrdersTableCellContext) => <span className="font-mono text-slate-600 text-xs">{item.getValue() as string}</span>,
      size: 80,
    },
    {
      accessorKey: "customer",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="orders-table-sort-customer"
        >
          Customer
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Customer",
      cell: (item: OrdersTableCellContext) => <span className="text-slate-700 text-xs">{(item.getValue() as string).split(" ")[0]}</span>,
    },
    {
      accessorKey: "amount",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="orders-table-sort-amount"
        >
          Amount
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Amount",
      cell: (item: OrdersTableCellContext) => <span className="font-semibold text-slate-800 text-xs">{item.getValue() as string}</span>,
    },
    {
      accessorKey: "status",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="orders-table-sort-status"
        >
          Status
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Status",
      cell: (item: OrdersTableCellContext) => {
        const cellValue = item.getValue();
        const statusValue =
          typeof cellValue === "string" ? cellValue : (cellValue as { value: string })?.value ?? "Unknown";

        console.log(`Debug flow: buildOrdersTableColumns status cell fired with`, {
          cellValue,
          statusValue,
        });

        return (
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${statusColor[statusValue] ?? "text-slate-600 bg-slate-100"}`}>
            {statusValue}
          </span>
        );
      },
    },
  ];
}

export function applyOrdersColumnFilters(
  updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState,
  helpers: OrdersTableColumnHelpers
) {
  console.log(`Debug flow: applyOrdersColumnFilters fired`);
  const newFilters = typeof updater === "function" ? updater([]) : updater;
  helpers.filtering.clear();
  newFilters.forEach((filter: { id: string; value: unknown }) => {
    helpers.filtering.set(filter.id, filter.value as string);
  });
}
