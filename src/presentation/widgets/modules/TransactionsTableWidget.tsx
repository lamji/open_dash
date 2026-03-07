"use client";

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
import type {
  OrdersTableColumnHelpers,
  TableFeatureConfig,
  TableWidgetConfig,
  TransactionsTableWidgetProps,
  TxRow,
} from "@/domain/widgets/types";
import { useTableState } from "../useTableState";
import {
  applyTransactionsColumnFilters,
  buildTransactionsTableColumns,
  DEFAULT_TRANSACTION_ROWS,
} from "./transactionsTable.shared";

export function TransactionsTableWidget({ data, preview = false }: TransactionsTableWidgetProps) {
  "use no memo";
  const config = data as TableWidgetConfig;
  const allRows: TxRow[] = ((config.rows as unknown as TxRow[] | undefined) ?? DEFAULT_TRANSACTION_ROWS);
  const rows = preview ? allRows.slice(0, 2) : allRows;
  const title = config.title ?? "Transactions";
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
    : (config.features ?? {
        sorting: true,
        filtering: true,
        pagination: true,
        columnVisibility: true,
        columnResizing: true,
        rowSelection: true,
        expandableRows: false,
      });

  const tableState = useTableState();
  const columnHelpers: OrdersTableColumnHelpers = {
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
  const columns = buildTransactionsTableColumns(features, columnHelpers);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(features.sorting && {
      getSortedRowModel: getSortedRowModel(),
      state: { sorting: tableState.sorting },
      onSortingChange: (
        updater:
          | ((old: typeof tableState.sorting) => typeof tableState.sorting)
          | typeof tableState.sorting
      ) => {
        const newSorting = typeof updater === "function" ? updater(tableState.sorting) : updater;
        tableState.setSorting(newSorting);
      },
    }),
    ...(features.filtering && {
      getFilteredRowModel: getFilteredRowModel(),
      state: { columnFilters: Object.entries(tableState.filtering).map(([id, value]) => ({ id, value })) },
      onColumnFiltersChange: (updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState) => {
        applyTransactionsColumnFilters(updater, columnHelpers);
      },
    }),
    ...(features.pagination && {
      getPaginationRowModel: getPaginationRowModel(),
      state: { pagination: tableState.pagination },
      onPaginationChange: (
        updater:
          | ((old: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number })
          | { pageIndex: number; pageSize: number }
      ) => {
        const newState = typeof updater === "function" ? updater(tableState.pagination) : updater;
        tableState.setPageIndex(newState.pageIndex);
      },
    }),
    ...(features.rowSelection && {
      state: { rowSelection: tableState.rowSelection },
      onRowSelectionChange: (
        updater:
          | ((old: Record<string, boolean>) => Record<string, boolean>)
          | Record<string, boolean>
      ) => {
        const newSelection = typeof updater === "function" ? updater(tableState.rowSelection) : updater;
        tableState.setRowSelection(newSelection);
      },
    }),
  });

  console.log(`[DEBUG] TransactionsTableWidget rendered`, { rows: rows.length, features });

  return (
    <div data-test-id="transactions-table-container" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-700" data-test-id="transactions-table-title">
          {title}
        </p>
        <div className="flex items-center gap-2">
          {features.filtering && (
            <Input
              placeholder="Filter..."
              value={tableState.filtering.desc ?? ""}
              onChange={(e) => tableState.setFiltering("desc", e.target.value)}
              className="h-7 text-xs w-40"
              data-test-id="transactions-table-filter-input"
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
              data-test-id="transactions-table-toggle-all-columns"
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
              data-test-id="transactions-table-clear-selection"
            >
              <Trash2 size={12} className="mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-xs border-collapse" data-test-id="transactions-table-table">
          <thead data-test-id="transactions-table-thead">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-slate-50 border-b-2 border-slate-200"
                data-test-id="transactions-table-thead-row"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left py-2.5 px-3 font-semibold text-slate-600 uppercase tracking-wide"
                    data-test-id={`transactions-table-th-${header.id}`}
                    style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody data-test-id="transactions-table-tbody">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                data-test-id={`transactions-table-row-${row.id}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2.5 px-3" data-test-id={`transactions-table-cell-${cell.id}`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {features.pagination && (
        <div className="flex items-center justify-between gap-2 py-2" data-test-id="transactions-table-pagination">
          <span className="text-xs text-slate-600" data-test-id="transactions-table-page-info">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2"
              onClick={() => tableState.setPageIndex(table.getState().pagination.pageIndex - 1)}
              disabled={!table.getCanPreviousPage()}
              data-test-id="transactions-table-prev-page"
            >
              <ChevronLeft size={12} />
            </Button>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => tableState.setPageSize(Number(e.target.value))}
              className="h-7 px-2 text-xs border border-slate-200 rounded"
              data-test-id="transactions-table-page-size"
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
              data-test-id="transactions-table-next-page"
            >
              <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      )}

      {features.rowSelection && Object.keys(tableState.rowSelection).length > 0 && (
        <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded" data-test-id="transactions-table-selection-info">
          {Object.keys(tableState.rowSelection).length} row(s) selected
        </div>
      )}
    </div>
  );
}
