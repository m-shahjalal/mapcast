"use client";

import React from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export function createExpanderColumn<TData>(options?: {
  width?: number;
  label?: React.ReactNode;
  renderToggle?: (row: Row<TData>) => React.ReactNode;
}): ColumnDef<TData, unknown> {
  const { width = 48, label = "", renderToggle } = options ?? {};
  return {
    id: "_expander",
    header: () => <div style={{ width }}>{label}</div>,
    size: width,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-end" style={{ width }}>
        {renderToggle ? (
          renderToggle(row)
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => row.toggleExpanded()}
            aria-label={row.getIsExpanded() ? "Collapse" : "Expand"}
          >
            {row.getIsExpanded() ? "−" : "+"}
          </Button>
        )}
      </div>
    ),
  } as ColumnDef<TData, unknown>;
}

export function createActionsColumn<TData>(
  render: (row: Row<TData>) => React.ReactNode,
  options?: {
    header?: React.ReactNode;
    align?: "left" | "right" | "center";
    width?: number;
  }
): ColumnDef<TData, unknown> {
  const { header = "Actions", align = "right", width } = options ?? {};
  return {
    id: "_actions",
    header: () => <div className="text-foreground text-right">{header}</div>,
    size: width,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div
        className={
          align === "right"
            ? "text-right"
            : align === "center"
            ? "text-center"
            : ""
        }
      >
        {render(row)}
      </div>
    ),
  } as ColumnDef<TData, unknown>;
}
