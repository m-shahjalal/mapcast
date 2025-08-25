import type {  SerwistGlobalConfig } from "@serwist/core";
import { PrefetchCacheEntry } from "next/dist/client/components/router-reducer/router-reducer-types";

export {};

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends unknown> {
    getExtraData?: () => Record<string, unknown> | undefined;
    updateExtraData?: (key: string, value: unknown) => void;
  }
}

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrefetchCacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;
