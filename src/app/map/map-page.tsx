"use client";

import { MapProvider, TopicItem } from "@/lib/map-context";
import { NewsSelect } from "@/server/schemas";
import dynamic from "next/dynamic";

const MapView = dynamic(
  () => import("./map-view").then((mod) => ({ default: mod.MapView })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full flex items-center justify-center bg-gray-100 h-screen">
        <div className="text-gray-500">Loading map...</div>
      </div>
    ),
  }
);

const TOPICS: TopicItem[] = [
  { label: "Trending", icon: "🔥" },
  { label: "Politics", icon: "🗳️" },
  { label: "Sports", icon: "⚽️" },
  { label: "Entertainment", icon: "🎬" },
  { label: "Technology", icon: "💻" },
  { label: "Other", icon: "📚" },
];

export function PinPointMap({ news }: { news: NewsSelect[] | null }) {
  console.log("news", news);

  const handleTopicSelect = (topic: TopicItem) => {
    console.info("Selected topic:", topic.label);
  };

  return (
    <MapProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <div className="relative flex-1 min-h-0">
          <MapView topics={TOPICS} onTopicSelect={handleTopicSelect} />
        </div>
      </div>
    </MapProvider>
  );
}
