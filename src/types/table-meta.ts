
export { };

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends unknown> {
    getExtraData?: () => Record<string, unknown> | undefined;
    updateExtraData?: (key: string, value: unknown) => void;
  }
}
