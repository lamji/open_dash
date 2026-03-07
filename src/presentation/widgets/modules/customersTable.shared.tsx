"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type Table,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type {
  CustomerRow,
  CustomersTableCellContext,
  OrdersTableColumnHelpers,
  SortableHeaderContext,
  TableFeatureConfig,
} from "@/domain/widgets/types";

export const DEFAULT_CUSTOMER_ROWS: CustomerRow[] = [
  { name: "Alice Johnson", email: "alice@acme.com", plan: "Pro", spend: "$1,200" },
  { name: "Bob Smith", email: "bob@corp.io", plan: "Enterprise", spend: "$8,400" },
  { name: "Carol White", email: "carol@shop.co", plan: "Free", spend: "$0" },
  { name: "Dave Brown", email: "dave@dev.ai", plan: "Pro", spend: "$1,200" },
];

export function buildCustomersTableColumns(
  features: TableFeatureConfig,
  helpers: OrdersTableColumnHelpers
): ColumnDef<CustomerRow>[] {
  const planColor: Record<string, string> = {
    Pro: "text-violet-700 bg-violet-50",
    Enterprise: "text-blue-700 bg-blue-50",
    Free: "text-slate-500 bg-slate-100",
  };

  return [
    ...(features.rowSelection
      ? [
          {
            id: "select",
            header: ({ table }: { table: Table<CustomerRow> }) => (
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
                data-test-id="customers-table-select-all"
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
                data-test-id={`customers-table-row-select-${row.id}`}
              />
            ),
            size: 40,
          },
        ]
      : []),
    {
      accessorKey: "name",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="customers-table-sort-name"
        >
          Name
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Name",
      cell: (item: CustomersTableCellContext) => (
        <span className="font-medium text-slate-800 text-xs">{(item.getValue() as string).split(" ")[0]}</span>
      ),
    },
    {
      accessorKey: "email",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="customers-table-sort-email"
        >
          Email
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Email",
      cell: (item: CustomersTableCellContext) => (
        <span className="text-slate-500 text-xs">{(item.getValue() as string).split("@")[0]}</span>
      ),
    },
    {
      accessorKey: "plan",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="customers-table-sort-plan"
        >
          Plan
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Plan",
      cell: (item: CustomersTableCellContext) => (
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${planColor[item.getValue() as string] ?? "text-slate-600 bg-slate-100"}`}>
          {item.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "spend",
      header: features.sorting ? ({ column }: SortableHeaderContext) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 px-1 py-1 rounded"
          data-test-id="customers-table-sort-spend"
        >
          Spend
          {column.getIsSorted() === "asc" && <ArrowUp size={12} />}
          {column.getIsSorted() === "desc" && <ArrowDown size={12} />}
          {!column.getIsSorted() && <ArrowUpDown size={12} className="opacity-40" />}
        </button>
      ) : "Spend",
      cell: (item: CustomersTableCellContext) => (
        <span className="font-semibold text-slate-800 text-xs">{item.getValue() as string}</span>
      ),
    },
  ];
}

export function applyCustomersColumnFilters(
  updater: ((old: ColumnFiltersState) => ColumnFiltersState) | ColumnFiltersState,
  helpers: OrdersTableColumnHelpers
) {
  const newFilters = typeof updater === "function" ? updater([]) : updater;
  helpers.filtering.clear();
  newFilters.forEach((filter: { id: string; value: unknown }) => {
    helpers.filtering.set(filter.id, filter.value as string);
  });
}
