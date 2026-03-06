"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table";

export interface TableState {
  sorting: SortingState;
  filtering: Record<string, string>;
  columnVisibility: Record<string, boolean>;
  rowSelection: RowSelectionState;
  columnSizing: Record<string, number>;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  expandedRows: Record<string, boolean>;
}

export interface TableActions {
  setSorting: (sorting: SortingState) => void;
  setFiltering: (columnId: string, value: string) => void;
  clearFiltering: (columnId?: string) => void;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;
  toggleColumnVisibility: (columnId: string) => void;
  setRowSelection: (selection: RowSelectionState) => void;
  toggleRowSelection: (rowId: string) => void;
  selectAllRows: (rowIds: string[]) => void;
  clearRowSelection: () => void;
  setColumnSizing: (sizing: Record<string, number>) => void;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  toggleExpandedRow: (rowId: string) => void;
  setExpandedRows: (rows: Record<string, boolean>) => void;
  reset: () => void;
}

const initialState: TableState = {
  sorting: [],
  filtering: {},
  columnVisibility: {},
  rowSelection: {},
  columnSizing: {},
  pagination: {
    pageIndex: 0,
    pageSize: 10,
  },
  expandedRows: {},
};

export const useTableState = create<TableState & TableActions>()(
  persist(
    (set) => ({
      ...initialState,
      setSorting: (sorting) => {
        console.log(`[DEBUG] useTableState setSorting called with:`, { sorting });
        set({ sorting });
      },
      setFiltering: (columnId, value) => {
        console.log(`[DEBUG] useTableState setFiltering called with:`, {
          columnId,
          value,
        });
        set((state) => ({
          filtering: {
            ...state.filtering,
            [columnId]: value,
          },
        }));
      },
      clearFiltering: (columnId) => {
        console.log(`[DEBUG] useTableState clearFiltering called with:`, {
          columnId,
        });
        set((state) => {
          if (!columnId) {
            return { filtering: {} };
          }
          const { [columnId]: _, ...rest } = state.filtering;
          return { filtering: rest };
        });
      },
      setColumnVisibility: (visibility: Record<string, boolean>) => {
        console.log(`[DEBUG] useTableState setColumnVisibility called with:`, {
          visibility,
        });
        set({ columnVisibility: visibility });
      },
      toggleColumnVisibility: (columnId) => {
        console.log(`[DEBUG] useTableState toggleColumnVisibility called with:`, {
          columnId,
        });
        set((state) => ({
          columnVisibility: {
            ...state.columnVisibility,
            [columnId]: !state.columnVisibility[columnId],
          },
        }));
      },
      setRowSelection: (selection) => {
        console.log(`[DEBUG] useTableState setRowSelection called with:`, {
          selection,
        });
        set({ rowSelection: selection });
      },
      toggleRowSelection: (rowId) => {
        console.log(`[DEBUG] useTableState toggleRowSelection called with:`, {
          rowId,
        });
        set((state) => ({
          rowSelection: {
            ...state.rowSelection,
            [rowId]: !state.rowSelection[rowId],
          },
        }));
      },
      selectAllRows: (rowIds) => {
        console.log(`[DEBUG] useTableState selectAllRows called with:`, {
          count: rowIds.length,
        });
        const selection: RowSelectionState = {};
        rowIds.forEach((id) => {
          selection[id] = true;
        });
        set({ rowSelection: selection });
      },
      clearRowSelection: () => {
        console.log(`[DEBUG] useTableState clearRowSelection called`);
        set({ rowSelection: {} });
      },
      setColumnSizing: (sizing: Record<string, number>) => {
        console.log(`[DEBUG] useTableState setColumnSizing called with:`, {
          sizing,
        });
        set({ columnSizing: sizing });
      },
      setPageIndex: (index) => {
        console.log(`[DEBUG] useTableState setPageIndex called with:`, { index });
        set((state) => ({
          pagination: { ...state.pagination, pageIndex: index },
        }));
      },
      setPageSize: (size) => {
        console.log(`[DEBUG] useTableState setPageSize called with:`, { size });
        set((state) => ({
          pagination: { ...state.pagination, pageSize: size, pageIndex: 0 },
        }));
      },
      toggleExpandedRow: (rowId) => {
        console.log(`[DEBUG] useTableState toggleExpandedRow called with:`, {
          rowId,
        });
        set((state) => ({
          expandedRows: {
            ...state.expandedRows,
            [rowId]: !state.expandedRows[rowId],
          },
        }));
      },
      setExpandedRows: (rows) => {
        console.log(`[DEBUG] useTableState setExpandedRows called with:`, {
          count: Object.keys(rows).length,
        });
        set({ expandedRows: rows });
      },
      reset: () => {
        console.log(`[DEBUG] useTableState reset called`);
        set(initialState);
      },
    }),
    {
      name: "table-state",
      version: 1,
    }
  )
);
