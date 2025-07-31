"use client";

import { Combobox } from "./combobox";
import { MapControls } from "./control";
import { TopicFilters } from "./topic-filter";
import { DateRangePicker } from "@/components/date-picker/date-range-picker";
import { useQueryParams } from "@/hooks/use-query";

export function TopBar() {
  const { setMultipleParams } = useQueryParams();

  return (
    <div className="absolute top-4 left-4 right-4 z-[999]">
      <div className="flex items-start gap-4 sm:justify-between justify-end">
        <div className="gap-2 flex-1 min-w-0 hidden sm:flex">
          <div className="hidden md:block">
            <Combobox />
          </div>
          <DateRangePicker
            onUpdate={({ range }) =>
              setMultipleParams({
                from: range.from.toISOString(),
                to: range.to?.toISOString() ?? new Date().toISOString(),
              })
            }
          />
          <TopicFilters />
        </div>
        <div className="flex-shrink-0">
          <MapControls />
        </div>
      </div>
    </div>
  );
}
