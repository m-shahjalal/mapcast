"use client";

import { InfinitePageLoader } from "@/components/page-loader";
import { LocationData, useMapContext } from "@/config/map-context";
import { NewsSelect } from "@/server/database/schemas";
import { parseRootDomain } from "@/utils/urls";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const MapView = dynamic(
  () => import("./map-view").then((mod) => ({ default: mod.MapView })),
  { ssr: false, loading: () => <InfinitePageLoader /> }
);

const formatLocation = (newsArray: NewsSelect[]): LocationData[] => {
  return newsArray
    .filter((news) => news.latitude && news.longitude)
    .map((news) => ({
      headline: news.title,
      date: news.createdAt,
      summary: news.summary,
      link: news.newsUrl,
      lat: parseFloat(news.latitude!),
      lng: parseFloat(news.longitude!),
      name: news.locationName ?? "Unknown Location",
      address:
        [news.locationCity, news.locationState, news.locationCountry]
          .filter(Boolean)
          .join(", ") || "Unknown Location",
      topic: news.topic,
      source: parseRootDomain(news.newsUrl) || "Unknown Source",
      geojson: null,
      boundingbox: undefined,
    }));
};

export function PinPointMap({ news }: { news: NewsSelect[] | null }) {
  const { setMapList } = useMapContext();
  useEffect(() => setMapList(formatLocation(news || [])), [news]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="relative flex-1 min-h-0">
        <MapView />
      </div>
    </div>
  );
}
