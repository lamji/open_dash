"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type Table,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type {
  OrdersTableColumnHelpers,
  SortableHeaderContext,
  TableFeatureConfig,
  TransactionsTableCellContext,
  TxRow,
} from "@/domain/widgets/types";

export const DEFAULT_TRANSACTION_ROWS: TxRow[] = [
  { date: "Mar 4", desc: "Stripe Payment", amount: "+$1,200", type: "credit" },
  { date: "Mar 3", desc: "AWS Invoice", amount: "-$340", type: "debit" },
  { date: "Mar 3", desc: "Refund #9921", amount: "+$89", type: "credit" },
  { date: "Mar 2", desc: "Payroll Run", amount: "-$12,400", type: "debit" },
];

export function buildTransactionsTableColumns(
  features: TableFeatureConfig,
  helpers: OrdersTableColumnHelpers
): ColumnDef<TxRow>[] {
  return [
    ...(features.rowSelection
      ? [
          {
            id: "select",
            header: ({ table }: { table: Table<TxRow> }) => (
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
                data-test-id="transactions-table-select-all"
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
                data-test-id={`transactions-table-row-select-${row.id}`}
              />
            ),
            size: 40,
          },
        ]
      : []),
    {
      accessorKey: "date",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="transactions-table-sort-date"
        >
          Date
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Date",
      cell: (item: TransactionsTableCellContext) => <span className="text-slate-500 text-xs">{item.getValue() as string}</span>,
    },
    {
      accessorKey: "desc",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="transactions-table-sort-desc"
        >
          Desc
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Desc",
      cell: (item: TransactionsTableCellContext) => <span className="text-slate-700 text-xs truncate">{item.getValue() as string}</span>,
    },
    {
      accessorKey: "amount",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="transactions-table-sort-amount"
        >
          Amount
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Amount",
      cell: (item: TransactionsTableCellContext) => {
        const row = item.row.original;
        return (
          <span className={`font-bold text-xs ${row.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
            {item.getValue() as string}
          </span>
        );
      },
    },
    {
      accessorKey: "type",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="transactions-table-sort-type"
        >
          Type
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Type",
      cell: (item: TransactionsTableCellContext) => (
        <span className="text-slate-500 text-xs capitalize">{item.getValue() as string}</span>
      ),
    },
  ];
}

export function applyTransactionsColumnFilters(
  updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState,
  helpers: OrdersTableColumnHelpers
) {
  const newFilters = typeof updater === "function" ? updater([]) : updater;
  helpers.filtering.clear();
  newFilters.forEach((filter: { id: string; value: unknown }) => {
    helpers.filtering.set(filter.id, filter.value as string);
  });
}
