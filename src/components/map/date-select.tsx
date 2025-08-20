"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryParams } from "@/hooks/use-query";
import { NewsMapFilters } from "@/types/query-filter";
import { Calendar } from "lucide-react";
import { useMemo } from "react";

export interface DateRange {
  from: Date;
  to: Date;
}

const dateRangeOptions = [
  { value: "breaking", label: "Breaking" },
  { value: "recent", label: "Recent" },
  { value: "last3days", label: "Last 3 days" },
  { value: "last7days", label: "Last 7 days" },
  { value: "last14days", label: "Last 14 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "thisweek", label: "This week" },
  { value: "lastweek", label: "Last week" },
  { value: "thismonth", label: "This month" },
  { value: "lastmonth", label: "Last month" },
] as const;

const styles = {
  trigger:
    "group max-w-[180px] h-10 rounded-full bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:ring-0 focus:ring-transparent focus:border-gray-200/50 dark:focus:border-gray-700/50",
  content:
    "w-[var(--radix-select-trigger-width)] min-w-[180px] max-w-[220px] rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/95 via-white/90 to-gray-50/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-800/95 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10",
  item: "rounded-lg hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 focus:bg-gradient-to-r focus:from-blue-50/80 focus:to-indigo-50/80 dark:focus:from-blue-900/30 dark:focus:to-indigo-900/30 transition-all duration-200",
};

// Pure function for date calculations
const createDateRange = (option: string): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = (date: Date) =>
    new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1);
  const daysAgo = (days: number) =>
    new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  const hoursAgo = (hours: number) =>
    new Date(now.getTime() - hours * 60 * 60 * 1000);

  const ranges: Record<string, DateRange> = {
    breaking: { from: hoursAgo(8), to: now }, // Last 8 hours
    recent: { from: daysAgo(2), to: endOfDay(today) }, // Last 3 days
    last3days: { from: daysAgo(3), to: endOfDay(today) },
    last7days: { from: daysAgo(7), to: endOfDay(today) },
    last14days: { from: daysAgo(14), to: endOfDay(today) },
    last30days: { from: daysAgo(30), to: endOfDay(today) },
    thisweek: (() => {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    })(),
    lastweek: (() => {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay() - 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    })(),
    thismonth: (() => {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    })(),
    lastmonth: (() => {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    })(),
  };

  return ranges[option] || ranges.breaking;
};

// Helper to find matching preset from URL dates
const findPresetFromDates = (from: Date | null, to: Date | null): string => {
  // If no dates in URL, default to breaking
  if (!from || !to) return "breaking";

  const fromTime = from.getTime();
  const toTime = to.getTime();

  // Check each preset to see if it matches current URL dates (with 1 hour tolerance)
  const tolerance = 60 * 60 * 1000; // 1 hour

  for (const option of dateRangeOptions) {
    const range = createDateRange(option.value);
    if (
      Math.abs(range.from.getTime() - fromTime) < tolerance &&
      Math.abs(range.to.getTime() - toTime) < tolerance
    ) {
      return option.value;
    }
  }

  return "breaking"; // fallback to breaking if no match
};

export function DateSelect() {
  const { setMultipleParams, getParams } = useQueryParams<NewsMapFilters>();

  // Get current URL params
  const fromParam = getParams("from");
  const toParam = getParams("to");

  // Convert string params to dates if they exist
  const fromDate = fromParam ? new Date(fromParam) : null;
  const toDate = toParam ? new Date(toParam) : null;

  // Determine current value based on URL params
  const currentValue = useMemo(() => {
    return findPresetFromDates(fromDate, toDate);
  }, [fromDate, toDate]);

  const handleValueChange = (value: string) => {
    if (value === "breaking") {
      // For breaking news (last 8 hours), still set URL params
      const range = createDateRange(value);
      setMultipleParams({
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        dateRange: value,
      } as any);
    } else {
      const range = createDateRange(value);
      setMultipleParams({
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        dateRange: value, // Optional: store the preset name as well
      } as any);
    }
  };

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger className={styles.trigger}>
        <Calendar className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
        <SelectValue placeholder="Select a range" />
      </SelectTrigger>
      <SelectContent className={styles.content}>
        {dateRangeOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={styles.item}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
