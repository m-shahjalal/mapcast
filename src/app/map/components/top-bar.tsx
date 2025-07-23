"use client";

import { Combobox } from "@/app/map/components/combobox";
import { useMapSearch } from "@/hooks/use-map-search";
import { TopicItem } from "@/lib/map-context";
import { newsTopicDropdown } from "@/shared/enum-list";
import { MapControls } from "./control";
import { TopicFilters } from "./topic-filter";
import { useState } from "react";
import { MAP_LAYERS } from "@/lib/map-constraint";

type LayerKey = keyof typeof MAP_LAYERS;

export function TopBar({
  currentLayer,
  onLayerChange,
}: {
  currentLayer: LayerKey;
  onLayerChange: (layer: LayerKey) => void;
}) {
  const [selectedTopics, setSelectedTopics] = useState<TopicItem[]>([]);

  const {
    searchResults,
    setSelectedLocation,
    setSearchQuery,
    selectedLocation,
  } = useMapSearch();

  const handleTopicSelect = (topic: TopicItem) => {
    if (selectedTopics.some((selected) => selected.topic === topic.topic)) {
      setSelectedTopics(
        selectedTopics.filter((selected) => selected.topic !== topic.topic)
      );
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

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
            <TopicFilters
              topics={newsTopicDropdown}
              onTopicSelect={handleTopicSelect}
              selectedTopics={selectedTopics}
            />
          </div>
        </div>
        <div className="flex-shrink-0">
          <MapControls />
        </div>
      </div>
    </div>
  );
}
