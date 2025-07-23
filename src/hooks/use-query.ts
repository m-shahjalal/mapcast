"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type ParamsObject = Record<string, string | null | undefined>;

export function useQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (keyOrObject: string | ParamsObject, value?: string | null) => {
      const params = new URLSearchParams(searchParams);

      if (typeof keyOrObject === "object") {
        Object.entries(keyOrObject).forEach(([key, val]) => {
          if (val === null || val === "" || val === undefined) {
            params.delete(key);
          } else {
            params.set(key, val);
          }
        });
      } else if (value === null || value === "" || value === undefined) {
        params.delete(keyOrObject);
      } else {
        params.set(keyOrObject, value);
      }

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const get = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const add = useCallback(
    (key: string, value: string) => {
      if (!value) return;

      const params = new URLSearchParams(searchParams);
      params.append(key, value);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const remove = useCallback(
    (keys: string | string[]) => {
      const params = new URLSearchParams(searchParams);
      const keysArray = Array.isArray(keys) ? keys : [keys];

      keysArray.forEach((key) => params.delete(key));
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clear = useCallback(
    (keysToKeep?: string[]) => {
      if (keysToKeep?.length) {
        const params = new URLSearchParams();
        keysToKeep.forEach((key) => {
          const value = searchParams.get(key);
          if (value) params.set(key, value);
        });
        return router.push(`?${params.toString()}`);
      }
      router.push(window.location.pathname);
    },
    [router, searchParams]
  );

  const getAllParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  return {
    updateParams,
    get,
    add,
    remove,
    clear,
    getAllParams,
  };
}
