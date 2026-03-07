"use client";

import { useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrderRow, OrdersTableWidgetProps, TableWidgetConfig } from "@/domain/widgets/types";
import { useTableState } from "../useTableState";
import {
  applyOrdersColumnFilters,
  buildOrdersTableColumns,
  buildOrdersTableControlledState,
  buildOrdersTableFeatures,
  DEFAULT_ORDER_ROWS,
} from "./ordersTable.shared";

export function OrdersTableWidget({ data, preview = false }: OrdersTableWidgetProps) {
  "use no memo";
  const config = data as TableWidgetConfig;
  const rawConfig = data as TableWidgetConfig & Record<string, unknown>;
  const allRows: OrderRow[] = ((config.rows as unknown as OrderRow[] | undefined) ?? DEFAULT_ORDER_ROWS);
  const rows = preview ? allRows.slice(0, 2) : allRows;
  const tableState = useTableState();
  const { features, featureOverrides, requestedPageSize } = buildOrdersTableFeatures(preview, config, rawConfig);
  const columnHelpers = {
    sorting: {
      value: tableState.sorting,
      set: tableState.setSorting,
    },
    filtering: {
      value: tableState.filtering,
      clear: tableState.clearFiltering,
      set: tableState.setFiltering,
    },
    rowSelection: {
      value: tableState.rowSelection,
      clear: tableState.clearRowSelection,
      toggle: tableState.toggleRowSelection,
      set: tableState.setRowSelection,
      selectAll: tableState.selectAllRows,
    },
  };
  const columns = buildOrdersTableColumns(features, columnHelpers);
  const tableControlledState = buildOrdersTableControlledState(features, columnHelpers, tableState.pagination);
  const title = config.title ?? "Recent Orders";

  console.log(`Debug flow: OrdersTableWidget fired with`, {
    preview,
    rowCount: rows.length,
    requestedPageSize,
    featureOverrides,
    resolvedFeatures: features,
  });

  useEffect(() => {
    console.log(`Debug flow: OrdersTableWidget pageSize sync fired with`, {
      preview,
      paginationEnabled: features.pagination,
      requestedPageSize,
      currentPageSize: tableState.pagination.pageSize,
    });
    if (
      preview ||
      !features.pagination ||
      requestedPageSize === undefined ||
      requestedPageSize <= 0 ||
      tableState.pagination.pageSize === requestedPageSize
    ) {
      return;
    }
    tableState.setPageSize(requestedPageSize);
  }, [preview, features.pagination, requestedPageSize, tableState.pagination.pageSize, tableState.setPageSize]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: tableControlledState,
    ...(features.sorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: (
        updater:
          | ((old: typeof tableState.sorting) => typeof tableState.sorting)
          | typeof tableState.sorting
      ) => {
        const newSorting = typeof updater === "function" ? updater(tableState.sorting) : updater;
        columnHelpers.sorting.set(newSorting);
      },
    }),
    ...(features.filtering && {
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange: (updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState) => {
        applyOrdersColumnFilters(updater, columnHelpers);
      },
    }),
    ...(features.pagination && {
      getPaginationRowModel: getPaginationRowModel(),
      onPaginationChange: (
        updater:
          | ((old: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number })
          | { pageIndex: number; pageSize: number }
      ) => {
        const newState = typeof updater === "function" ? updater(tableState.pagination) : updater;
        if (newState.pageSize !== tableState.pagination.pageSize) {
          tableState.setPageSize(newState.pageSize);
        }
        if (newState.pageIndex !== tableState.pagination.pageIndex) {
          tableState.setPageIndex(newState.pageIndex);
        }
      },
    }),
    ...(features.rowSelection && {
      onRowSelectionChange: (
        updater:
          | ((old: Record<string, boolean>) => Record<string, boolean>)
          | Record<string, boolean>
      ) => {
        const newSelection = typeof updater === "function" ? updater(tableState.rowSelection) : updater;
        columnHelpers.rowSelection.set(newSelection);
      },
    }),
  });

  console.log(`Debug flow: OrdersTableWidget rendered with`, {
    rows: rows.length,
    features,
  });

  return (
    <div data-test-id="orders-table-container" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-700" data-test-id="orders-table-title">
          {title}
        </p>
        <div className="flex items-center gap-2">
          {features.filtering && (
            <Input
              placeholder="Filter..."
              value={tableState.filtering.customer ?? ""}
              onChange={(e) => tableState.setFiltering("customer", e.target.value)}
              className="h-7 text-xs w-40"
              data-test-id="orders-table-filter-input"
            />
          )}
          {features.columnVisibility && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                const allVisible = Object.values(table.getState().columnVisibility).every((value) => value !== false);
                table.toggleAllColumnsVisible(!allVisible);
              }}
              data-test-id="orders-table-toggle-all-columns"
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
              data-test-id="orders-table-clear-selection"
            >
              <Trash2 size={12} className="mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-xs border-collapse" data-test-id="orders-table-table">
          <thead data-test-id="orders-table-thead">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-slate-50 border-b-2 border-slate-200"
                data-test-id="orders-table-thead-row"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left py-2.5 px-3 font-semibold text-slate-600 uppercase tracking-wide"
                    data-test-id={`orders-table-th-${header.id}`}
                    style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody data-test-id="orders-table-tbody">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                data-test-id={`orders-table-row-${row.id}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2.5 px-3" data-test-id={`orders-table-cell-${cell.id}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {features.pagination && (
        <div className="flex items-center justify-between gap-2 py-2" data-test-id="orders-table-pagination">
          <span className="text-xs text-slate-600" data-test-id="orders-table-page-info">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              data-test-id="orders-table-prev-page"
            >
              <ChevronLeft size={12} />
            </Button>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-7 px-2 text-xs border border-slate-200 rounded"
              data-test-id="orders-table-page-size"
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
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              data-test-id="orders-table-next-page"
            >
              <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      )}

      {features.rowSelection && Object.keys(tableState.rowSelection).length > 0 && (
        <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded" data-test-id="orders-table-selection-info">
          {Object.keys(tableState.rowSelection).length} row(s) selected
        </div>
      )}
    </div>
  );
}
