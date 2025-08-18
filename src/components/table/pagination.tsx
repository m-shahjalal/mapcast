"use client";

import React from "react";
import { Table as TableInstance } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TablePaginationProps = {
  table: TableInstance<any>;
  pageSizeOptions?: number[];
  totalItems?: number;
  className?: string;
};

export function TablePagination({
  table,
  pageSizeOptions = [10, 20, 50, 100],
  totalItems,
  className,
}: TablePaginationProps) {
  const pagination = table.getState().pagination;
  const pageIndex = pagination?.pageIndex ?? 0;
  const pageSize = pagination?.pageSize ?? pageSizeOptions[0];

  const canPrev = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  const pageCount = table.getPageCount();

  return (
    <div
      className={
        "flex items-center justify-between gap-3 p-3 " + (className ?? "")
      }
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => table.setPageSize(Number(v))}
        >
          <SelectTrigger className="h-8 w-[84px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {typeof totalItems === "number" ? (
          <span className="ml-3 text-sm text-gray-600">
            {Math.min((pageIndex + 1) * pageSize, totalItems)} of {totalItems}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Page {pageCount > 0 ? pageIndex + 1 : 0} of {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!canPrev}
          >
            «
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!canPrev}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!canNext}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!canNext}
          >
            »
          </Button>
        </div>
      </div>
    </div>
  );
}
