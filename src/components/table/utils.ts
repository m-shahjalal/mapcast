import type { Table } from "@tanstack/react-table";

export const getTableExtraDataModel = <TData>(
  table: Table<TData>,
  name: string
) => ({
  value: table.options.meta?.getExtraData?.()?.[name],
  onChange: <V>(value: V) => table.options.meta?.updateExtraData?.(name, value),
});
