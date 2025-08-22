"use client";

import { useMemo, useState } from "react";
import type {
  ColumnFiltersState,
  ExpandedState,
  PaginationState,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";

export type UseDataTableOptions<TExtra extends Record<string, unknown>> = {
  initialPageSize?: number;
  initialExtra?: TExtra;
};

export function useDataTableState<TExtra extends Record<string, unknown>>(
  options?: UseDataTableOptions<TExtra>
) {
  const { initialPageSize = 10, initialExtra } = options ?? {};

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [extraData, setExtraData] = useState<TExtra | undefined>(initialExtra);

  const updateExtraData = <K extends keyof TExtra>(
    key: K,
    value: TExtra[K]
  ) => {
    setExtraData((prev) => ({ ...(prev ?? ({} as TExtra)), [key]: value }));
  };

  return useMemo(
    () => ({
      rowSelection,
      setRowSelection,
      sorting,
      setSorting,
      columnFilters,
      setColumnFilters,
      pagination,
      setPagination,
      expanded,
      setExpanded,
      globalFilter,
      setGlobalFilter,
      extraData,
      updateExtraData,
    }),
    [
      rowSelection,
      sorting,
      columnFilters,
      pagination,
      expanded,
      globalFilter,
      extraData,
    ]
  );
}
