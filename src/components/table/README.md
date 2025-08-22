# DataTable Module

Reusable wrapper around TanStack Table for consistent tables across the app.

## Quick start

```tsx
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/table";
import { useDataTableState } from "@/hooks/use-data-table";

interface User {
  id: string;
  name: string;
  email: string;
}

const columnHelper = createColumnHelper<User>();

const columns: ColumnDef<User>[] = [
  columnHelper.accessor("name", { header: "Name", cell: (c) => c.getValue() }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (c) => c.getValue(),
  }),
];

export default function UsersTable({ data }: { data: User[] }) {
  const state = useDataTableState<{}>({ initialPageSize: 20 });

  return (
    <DataTable
      columns={columns}
      data={data}
      rowSelection={state.rowSelection}
      onRowSelectionChange={state.setRowSelection}
      sorting={state.sorting}
      onSortingChange={state.setSorting}
      columnFilters={state.columnFilters}
      onColumnFiltersChange={state.setColumnFilters}
      pagination={state.pagination}
      onPaginationChange={state.setPagination}
      expanded={state.expanded}
      onExpandedChange={state.setExpanded}
      caption="Users"
    />
  );
}
```

## Extra data (filters)

To bind external filters/sort meta:

```tsx
import { getTableExtraDataModel } from "@/components/table";

const columns: ColumnDef<User>[] = [
  columnHelper.accessor("name", {
    header: ({ table }) => {
      const { value, onChange } = getTableExtraDataModel(table, "nameFilter");
      return (
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      );
    },
  }),
];
```

Pass `extraData` and `updateExtraData` to `<DataTable />`.

## Pagination UI

Use `<TablePagination table={table} />` when you hold the `table` instance yourself or the grid is embedded differently.
