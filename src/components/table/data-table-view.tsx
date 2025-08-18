"use client";

import React, { useEffect, useRef } from "react";
import { flexRender, Row, Table as TableInstance } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type DataTableViewProps<TData> = {
  table: TableInstance<TData>;
  className?: string;
  caption?: React.ReactNode;
  emptyState?: React.ReactNode;
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
  onBottomReach?: () => void;
  bottomOffset?: number;
  loadingMore?: boolean;
};

export function DataTableView<TData>({
  table,
  className,
  caption,
  emptyState,
  renderExpandedRow,
  onBottomReach,
  bottomOffset = 160,
}: DataTableViewProps<TData>) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!onBottomReach) return;
    const el = sentinelRef.current;
    if (!el) return;
    let busy = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (busy) return;
        busy = true;
        Promise.resolve().then(() => {
          onBottomReach();
          busy = false;
        });
      },
      { root: null, rootMargin: `0px 0px ${bottomOffset}px 0px`, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onBottomReach, bottomOffset]);

  const rows = table.getRowModel().rows;
  const hasRows = rows.length > 0;
  const leafColCount = table.getAllLeafColumns().length;

  return (
    <div className={className}>
      <Table>
        {caption ? <TableCaption>{caption}</TableCaption> : null}
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
          {!hasRows ? (
            <TableRow>
              <TableCell colSpan={leafColCount} className="h-24 text-center">
                {emptyState ?? "No results"}
              </TableCell>
            </TableRow>
          ) : null}
          {rows.map((row) => (
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
              {row.getIsExpanded() && renderExpandedRow ? (
                <TableRow>
                  <TableCell colSpan={row.getVisibleCells().length}>
                    {renderExpandedRow(row)}
                  </TableCell>
                </TableRow>
              ) : null}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
