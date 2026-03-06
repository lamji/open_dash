"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Button,
} from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTableState } from "@/presentation/widgets/useTableState";
import type { TableFeatureConfig } from "@/domain/widgets/types";

export interface TableWidgetWrapperProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  title: string;
  features?: TableFeatureConfig;
  pageSize?: number;
  testIdPrefix?: string;
}

export function TableWidgetWrapper<TData>({
  data,
  columns,
  title,
  features = {
    sorting: true,
    filtering: true,
    pagination: true,
    columnVisibility: true,
    columnResizing: true,
    rowSelection: true,
  },
  testIdPrefix = "table",
}: TableWidgetWrapperProps<TData>) {
  const tableState = useTableState();

  // Create column filters from the filtering state
  const columnFilters: ColumnFiltersState = useMemo(() => {
    return Object.entries(tableState.filtering).map(([id, value]) => ({ id, value }));
  }, [tableState.filtering]);

  const table = useReactTable({
    data,
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
      state: { columnFilters },
      onColumnFiltersChange: (updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState) => {
        const newFilters = typeof updater === "function" ? updater(columnFilters) : updater;
        tableState.clearFiltering();
        newFilters.forEach((f) => {
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
        tableState.setPageSize(newState.pageSize);
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

  console.log(`[DEBUG] TableWidgetWrapper rendered with`, {
    dataCount: data.length,
    features,
    currentPage: tableState.pagination.pageIndex + 1,
  });

  return (
    <div data-test-id={`${testIdPrefix}-container`} className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-700" data-test-id={`${testIdPrefix}-title`}>
          {title}
        </p>
        <div className="flex items-center gap-2">
          {features.filtering && (
            <Input
              placeholder="Filter..."
              value={tableState.filtering["name"] ?? tableState.filtering["customer"] ?? ""}
              onChange={(e) => {
                const filterKey = Object.keys(tableState.filtering)[0] || "name";
                tableState.setFiltering(filterKey, e.target.value);
              }}
              className="h-7 text-xs w-40"
              data-test-id={`${testIdPrefix}-filter-input`}
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
              data-test-id={`${testIdPrefix}-toggle-all-columns`}
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
              data-test-id={`${testIdPrefix}-clear-selection`}
            >
              <Trash2 size={12} className="mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-xs border-collapse" data-test-id={`${testIdPrefix}-table`}>
          <thead data-test-id={`${testIdPrefix}-thead`}>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="bg-slate-50 border-b-2 border-slate-200"
                data-test-id={`${testIdPrefix}-thead-row`}
              >
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="text-left py-2.5 px-3 font-semibold text-slate-600 uppercase tracking-wide"
                    data-test-id={`${testIdPrefix}-th-${h.id}`}
                    style={{ width: h.getSize() !== 150 ? `${h.getSize()}px` : undefined }}
                  >
                    {features.sorting && h.column.columnDef.header && typeof h.column.columnDef.header === "string" ? (
                      <button
                        onClick={() => h.column.toggleSorting(h.column.getIsSorted() === "asc")}
                        className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
                        data-test-id={`${testIdPrefix}-sort-${h.id}`}
                      >
                        {h.column.columnDef.header}
                        {h.column.getIsSorted() === "asc" && <ArrowUp size={12} />}
                        {h.column.getIsSorted() === "desc" && <ArrowDown size={12} />}
                        {!h.column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
                      </button>
                    ) : (
                      flexRender(h.column.columnDef.header, h.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody data-test-id={`${testIdPrefix}-tbody`}>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                data-test-id={`${testIdPrefix}-row-${row.id}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2.5 px-3" data-test-id={`${testIdPrefix}-cell-${cell.id}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {features.pagination && (
        <div
          className="flex items-center justify-between gap-2 py-2"
          data-test-id={`${testIdPrefix}-pagination`}
        >
          <span className="text-xs text-slate-600" data-test-id={`${testIdPrefix}-page-info`}>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => tableState.setPageIndex(Math.max(0, table.getState().pagination.pageIndex - 1))}
              disabled={!table.getCanPreviousPage()}
              data-test-id={`${testIdPrefix}-prev-page`}
            >
              <ChevronLeft size={12} />
            </Button>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => tableState.setPageSize(Number(e.target.value))}
              className="h-7 px-2 text-xs border border-slate-200 rounded"
              data-test-id={`${testIdPrefix}-page-size`}
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
              data-test-id={`${testIdPrefix}-next-page`}
            >
              <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      )}

      {features.rowSelection && Object.keys(tableState.rowSelection).length > 0 && (
        <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded" data-test-id={`${testIdPrefix}-selection-info`}>
          {Object.keys(tableState.rowSelection).length} row(s) selected
        </div>
      )}
    </div>
  );
}
