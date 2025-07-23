"use client";

import { Combobox } from "@/app/map/components/combobox";
import { useMapSearch } from "@/hooks/use-map-search";
import { newsTopicDropdown } from "@/shared/enum-list";
import { MapControls } from "./control";
import { TopicFilters } from "./topic-filter";

export function TopBar() {
  const {
    searchResults,
    setSelectedLocation,
    setSearchQuery,
    selectedLocation,
  } = useMapSearch();

  return (
    <div className="absolute top-4 left-4 right-4 z-[999]">
      <div className="flex items-start gap-4 justify-between">
        <div className="flex items-start gap-5 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <Combobox
              selectedLocation={selectedLocation}
              data={searchResults}
              setSearchQuery={setSearchQuery}
              setSelectedLocation={setSelectedLocation}
            />
          </div>
          <div className="flex flex-1 justify-center min-w-0 mt-1">
            <TopicFilters />
          </div>
        </div>
        <div className="flex-shrink-0">
          <MapControls />
        </div>
      </div>
    </div>
  );
}
