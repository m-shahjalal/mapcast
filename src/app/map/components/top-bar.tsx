"use client";

import { useMapSearch } from "@/hooks/use-map-search";
import { TopicItem } from "@/lib/map-context";
import { MapControls } from "./control";
import { TopicFilters } from "./topic-filter";
import { Combobox } from "@/app/map/components/combobox";

interface TopBarProps {
  topics: TopicItem[];
  onTopicSelect?: (topic: TopicItem) => void;
}

export function TopBar({ topics, onTopicSelect }: TopBarProps) {
  const {
    searchResults,
    setSelectedLocation,
    setSearchQuery,
    selectedLocation,
  } = useMapSearch();

  return (
    <div className="absolute top-4 left-4 right-4 z-[999]">
      <div className="flex items-center gap-4 justify-between">
        <div className="lg:flex items-center gap-5">
          <Combobox
            selectedLocation={selectedLocation}
            data={searchResults}
            setSearchQuery={setSearchQuery}
            setSelectedLocation={setSelectedLocation}
          />

          <div className="hidden md:flex flex-1 justify-center">
            <TopicFilters topics={topics} onTopicSelect={onTopicSelect} />
          </div>
        </div>
        <div className="flex-shrink-0">
          <MapControls />
        </div>
      </div>

      <div className="md:hidden mt-3">
        <TopicFilters topics={topics} onTopicSelect={onTopicSelect} />
      </div>
    </div>
  );
}
