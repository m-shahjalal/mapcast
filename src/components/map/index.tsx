"use client";

import { MAP_LAYERS } from "@/config/map-constraint";
import { MapCountry, useMapContext } from "@/config/map-context";
import { useQueryParams } from "@/hooks/use-query";
import { NewsType } from "@/server/database/schemas";
import { NewsMapFilters } from "@/types/query-filter";
import { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { LocationHighlighter } from "./highlighter";
import { NewsMarkers } from "./marker";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { PopupNews } from "./popup";
import { TopBar } from "./top-bar";

type Props = {
  news: NewsType[];
  location: MapCountry | null;
};

export function PinPointMap({ news, location }: Props) {
  const map = useMapContext();

  const { getParams } = useQueryParams<NewsMapFilters>();
  const country = getParams("country");

  useEffect(() => {
    map.setPending(false);
    map.setMapList(news);
    map.setCountry(location ?? null);
  }, [news, country]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="relative flex-1 min-h-0">
        <div className="h-full w-full relative">
          <MapContainer
            center={map.center}
            zoom={map.zoom}
            minZoom={3}
            maxZoom={18}
            className="h-full w-full"
            zoomControl={false}
            preferCanvas
            maxBounds={[
              [-85, -180],
              [85, 180],
            ]}
            maxBoundsViscosity={1.0}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
          >
            <TileLayer
              url={MAP_LAYERS[map.currentLayer].url}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

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
