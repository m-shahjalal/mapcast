"use client";

import { MAP_LAYERS } from "@/config/map-constraint";
import { useMapContext } from "@/config/map-context";
import { NewsType } from "@/server/database/schemas";
import { useCallback, useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { LocationHighlighter } from "./components/highlighter";
import { NewsMarkers } from "./components/marker";
import { TopBar } from "./components/top-bar";

interface PinPointMapProps {
  news: NewsType[];
}

export function PinPointMap({ news }: PinPointMapProps) {
  const { center, zoom, currentLayer, setMapList } = useMapContext();
  const [isMapReady, setIsMapReady] = useState(false);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  useEffect(() => {
    setMapList(news);
  }, [news, setMapList]);

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
            {isMapReady && <NewsMarkers />}
            {isMapReady && <LocationHighlighter />}
            {isMapReady && <TopBar />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
