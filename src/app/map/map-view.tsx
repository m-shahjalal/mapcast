"use client";
import { MAP_LAYERS } from "@/config/map-constraint";
import { useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { TopBar } from "./components/top-bar";
import { NewsMarkers } from "./news-marker";
import "leaflet/dist/leaflet.css";
import { MobileBottomBar } from "./components/mobile-bottom-bar";
import { NewsSelect } from "@/server/database/schemas";
import { useMapContext } from "@/config/map-context";

export function MapView({ news }: { news?: NewsSelect[] | null }) {
  const { center, zoom, currentLayer } = useMapContext();
  const [isMapReady, setIsMapReady] = useState(false);
  const selectedLayer = MAP_LAYERS[currentLayer];

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={3}
        className="h-full w-full"
        zoomControl={false}
        maxZoom={18}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        maxBoundsViscosity={1.0}
        whenReady={handleMapReady}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer key={currentLayer} url={selectedLayer.url} />

        {isMapReady && news && <NewsMarkers news={news} />}
        {isMapReady && <TopBar />}
        {isMapReady && <MobileBottomBar />}
      </MapContainer>

      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  );
}
