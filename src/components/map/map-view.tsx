"use client";

import { MAP_LAYERS } from "@/config/map-constraint";
import { useMapContext } from "@/config/map-context";
import "leaflet/dist/leaflet.css";
import { useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { LocationHighlighter } from "./components/highlighter";
import { LocationMarker } from "./components/location-marker";
import { MobileBottomBar } from "./components/mobile-bottom-bar";
import { TopBar } from "./components/top-bar";
import { NewsMarkers } from "./news-marker";
import { Spinner } from "../ui/spinner";

export function MapView() {
  const { center, zoom, currentLayer, isPending, mapList } = useMapContext();
  const [isMapReady, setIsMapReady] = useState(false);
  const selectedLayer = MAP_LAYERS[currentLayer];

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  return (
    <div className="h-full w-full relative">
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <Spinner size={32} />
        </div>
      )}
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
        {isMapReady && <NewsMarkers news={mapList} />}
        {isMapReady && <LocationHighlighter />}
        {isMapReady && <LocationMarker />}
        {isMapReady && <TopBar />}
        {isMapReady && <MobileBottomBar />}
      </MapContainer>
    </div>
  );
}
