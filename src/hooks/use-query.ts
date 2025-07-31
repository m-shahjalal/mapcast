"use client";
import { BaseFilters } from "@/types/query-filter";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useQueryParams<T = BaseFilters>() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function getParams(key?: keyof T): any {
    if (typeof key === "string") {
      // Single key - return single param
      return searchParams.get(key);
    } else if (Array.isArray(key)) {
      // Array of keys - return object with those keys
      const result: Record<string, string> = {};
      key.forEach((k) => {
        const value = searchParams.get(k as string);
        if (value !== null) {
          result[k as string] = value;
        }
      });
      return result;
    } else {
      // No argument - return all params as object
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return params as T;
    }
  }

  // setParams: replace existing key or create new one
  const setParams = useCallback(
    (key: keyof T, value: string | null) => {
      const params = new URLSearchParams(searchParams);

      if (value == null) {
        params.delete(key as string);
      } else {
        params.set(key as string, value);
      }

      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;
      router.push(newUrl);
    },
    [router, searchParams]
  );

  // setMultipleParams: set multiple parameters at once (more efficient)
  const setMultipleParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;
      router.push(newUrl);
    },
    [router, searchParams]
  );

  const clearParams = useCallback(
    (keys?: string | string[] | "all") => {
      if (keys === "all" || keys === undefined) {
        return router.push(window.location.pathname);
      }
      const params = new URLSearchParams(searchParams);

      if (typeof keys === "string") {
        params.delete(keys);
      } else if (Array.isArray(keys)) {
        keys.forEach((key) => params.delete(key));
      }

      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;
      router.push(newUrl);
    },
    [router, searchParams]
  );

  // hasParam: check if a parameter exists
  const hasParam = useCallback(
    (key: string): boolean => {
      return searchParams.has(key);
    },
    [searchParams]
  );

  // toggleParam: toggle a boolean-like parameter
  const toggleParam = useCallback(
    (
      key: string,
      trueValue: string = "true",
      falseValue: string | null = null
    ) => {
      const currentValue = searchParams.get(key);
      const newValue = currentValue === trueValue ? falseValue : trueValue;
      setParams(key as keyof T, newValue);
    },
    [searchParams, setParams]
  );

  return {
    getParams,
    setParams,
    setMultipleParams,
    clearParams,
    hasParam,
    toggleParam,
  };
}
