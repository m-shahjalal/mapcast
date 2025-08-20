"use client";

import { MAP_LAYERS } from "@/config/map-constraint";
import { useMapContext } from "@/config/map-context";
import { NewsType } from "@/server/database/schemas";
import { useCallback, useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { LocationHighlighter } from "./highlighter";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { EnhancedNewsMarkers } from "./news-marker";
import { TopBar } from "./top-bar";

export function PinPointMap({ news }: { news: NewsType[] }) {
  const { center, zoom, currentLayer, setMapList } = useMapContext();
  const [isMapReady, setIsMapReady] = useState(false);

  const handleMapReady = useCallback(() => setIsMapReady(true), []);
  useEffect(() => setMapList(news), [news, setMapList]);

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
            <TileLayer key={currentLayer} url={MAP_LAYERS[currentLayer].url} />
            {isMapReady && <EnhancedNewsMarkers />}
            {isMapReady && <LocationHighlighter />}
            {isMapReady && <TopBar />}
            {isMapReady && <MobileBottomBar />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
