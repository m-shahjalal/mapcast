"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table as TableInstance,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableProps<
  TData,
  TExtra extends Record<string, unknown> = Record<string, unknown>
> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  className?: string;

  // selection
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;

  // sorting
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  // filtering
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;

  // pagination
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  manualPagination?: boolean;
  pageCount?: number;

  // expansion
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;

  // external extra data (filters, etc.)
  extraData?: TExtra;
  updateExtraData?: <K extends keyof TExtra>(key: K, value: TExtra[K]) => void;

  // infinite scroll
  onBottomReach?: () => void;
  bottomOffset?: number; // px
  loadingMore?: boolean;

  // empty state
  emptyState?: React.ReactNode;
  caption?: React.ReactNode;
};

export function DataTable<
  TData,
  TExtra extends Record<string, unknown> = Record<string, unknown>
>(props: DataTableProps<TData, TExtra>) {
  const {
    columns,
    data,
    className,
    rowSelection,
    onRowSelectionChange,
    sorting,
    onSortingChange,
    columnFilters,
    onColumnFiltersChange,
    globalFilter,
    onGlobalFilterChange,
    pagination,
    onPaginationChange,
    manualPagination,
    pageCount,
    expanded,
    onExpandedChange,
    extraData,
    updateExtraData,
    onBottomReach,
    bottomOffset = 160,
    loadingMore,
    emptyState,
  } = props;

  const tableState = useMemo(() => {
    const s: Record<string, unknown> = {};
    if (rowSelection !== undefined) s.rowSelection = rowSelection;
    if (sorting !== undefined) s.sorting = sorting;
    if (columnFilters !== undefined) s.columnFilters = columnFilters;
    if (pagination !== undefined) s.pagination = pagination;
    if (expanded !== undefined) s.expanded = expanded;
    if (globalFilter !== undefined) s.globalFilter = globalFilter;
    return s;
  }, [
    rowSelection,
    sorting,
    columnFilters,
    pagination,
    expanded,
    globalFilter,
  ]);

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination,
    pageCount,
    onRowSelectionChange,
    onSortingChange,
    onColumnFiltersChange,
    onPaginationChange,
    onExpandedChange,
    state: tableState,
    meta: {
      getExtraData: () => extraData,
      updateExtraData: (key: string, value: unknown) => {
        if (!updateExtraData) return;
        updateExtraData(key as keyof TExtra, value as TExtra[keyof TExtra]);
      },
    },
  });

  // global filter binding convenience: if provided, wire to table
  useEffect(() => {
    if (onGlobalFilterChange) {
      table.setGlobalFilter(globalFilter ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Bottom reach detection via IntersectionObserver (no extra deps)
  useEffect(() => {
    if (!onBottomReach) return;
    const el = sentinelRef.current;
    if (!el) return;

    let ticking = false;
    const handleReach = (entries: IntersectionObserverEntry[]) => {
      if (!entries[0].isIntersecting) return;
      if (loadingMore) return;
      if (ticking) return;
      ticking = true;
      Promise.resolve().then(() => {
        onBottomReach();
        ticking = false;
      });
    };

    const observer = new IntersectionObserver(handleReach, {
      root: null,
      rootMargin: `0px 0px ${bottomOffset}px 0px`,
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onBottomReach, loadingMore, bottomOffset]);

  const hasRows = table.getRowModel().rows.length > 0;

  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="whitespace-nowrap">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {!hasRows && (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyState ?? "No results"}
              </TableCell>
            </TableRow>
          )}
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <TableRow
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow>
                  <TableCell colSpan={row.getVisibleCells().length}>
                    {row.original && (row as any).renderExpanded
                      ? (row as any).renderExpanded(row)
                      : null}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export type { TableInstance };
