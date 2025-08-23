"use client";

import { MAP_LAYERS } from "@/config/map-constraint";
import { useMapContext } from "@/config/map-context";
import { NewsType } from "@/server/database/schemas";
import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { LocationHighlighter } from "./highlighter";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { TopBar } from "./top-bar";
import { useQueryParams } from "@/hooks/use-query";
import { NewsMapFilters } from "@/types/query-filter";
import { NewsMarkers } from "./marker";
import { PopupNews } from "./popup";

type Props = {
  news: NewsType[] | Record<string, any>;
};

export function PinPointMap({ news }: Props) {
  const { center, zoom, currentLayer, setMapList, setLocation, setPending } =
    useMapContext();
  const [isMapReady, setIsMapReady] = useState(false);
  const { getParams } = useQueryParams<NewsMapFilters>();
  const country = getParams("country");

  const handleMapReady = useCallback(() => {
    console.log("Map ready!");
    setIsMapReady(true);
  }, []);

  useEffect(() => {
    setPending(false);

    if (!Array.isArray(news)) {
      return setLocation(news as any);
    }

    setMapList(news);

    const firstNews = news.find(
      (item) => item.latitude && item.longitude && item.country && item.geojson
    ) as NewsType;

    if (country && firstNews) {
      setLocation({
        latitude: firstNews.latitude,
        longitude: firstNews.longitude,
        name: firstNews.country,
        geojson: firstNews.geojson,
      } as any);
    }
  }, [news, country, setMapList, setLocation, setPending]);

  console.log("Rendering map with:", {
    center,
    zoom,
    currentLayer,
    isMapReady,
  });

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="relative flex-1 min-h-0">
        <div className="h-full w-full relative">
          <MapContainer
            center={center}
            zoom={zoom}
            minZoom={3}
            maxZoom={18}
            className="h-full w-full"
            zoomControl={false}
            maxBounds={[
              [-85, -180],
              [85, 180],
            ]}
            maxBoundsViscosity={1.0}
            whenReady={handleMapReady}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <TileLayer
              url={MAP_LAYERS[currentLayer].url}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Always render components - remove conditional rendering for debugging */}
            <NewsMarkers />
            <LocationHighlighter />
            <TopBar />
            <MobileBottomBar />
            <PopupNews />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
