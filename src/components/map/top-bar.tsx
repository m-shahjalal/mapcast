"use client";

import { MapControls } from "./control";
import { ClearSelection } from "./select-clear";
import { CountrySelect } from "./select-country";
import { DateSelect } from "./select-date";
import { TopicFilters } from "./select-topic";

export function TopBar() {
  return (
    <div className="absolute top-4 left-4 right-4 z-[999]">
      <div className="flex items-start gap-4 sm:justify-between justify-end">
        <div className="gap-2 flex-1 min-w-0 hidden sm:flex justify-start">
          <CountrySelect />
          <DateSelect />
          <TopicFilters />
          <ClearSelection />
        </div>
        <MapControls />
      </div>
    </div>
  );
}
