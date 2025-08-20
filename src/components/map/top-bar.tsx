"use client";

import { useQueryParams } from "@/hooks/use-query";
import { MapControls } from "./control";
import { CountrySelect } from "./country-select";
import { DateSelect } from "./date-select";
import { TopicFilters } from "./topic-filter";

export function TopBar() {
  return (
    <div className="absolute top-4 left-4 right-4 z-[999]">
      <div className="flex items-start gap-4 sm:justify-between justify-end">
        <div className="gap-2 flex-1 min-w-0 hidden sm:flex">
          <CountrySelect />
          <DateSelect />
          <TopicFilters />
        </div>
        <div className="flex-shrink-0">
          <MapControls />
        </div>
      </div>
    </div>
  );
}
