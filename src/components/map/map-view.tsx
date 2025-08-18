"use client";

import { MAP_LAYERS } from "@/config/map-constraint";
import { useMapContext } from "@/config/map-context";
import "leaflet/dist/leaflet.css";
import { useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { LocationHighlighter } from "./components/highlighter";
import { LocationMarker } from "./components/location-marker";
import { TopBar } from "./components/top-bar";
import { NewsMarkers } from "./news-marker";

export function MapView() {
  const { center, zoom, currentLayer, isPending, mapList } = useMapContext();
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
        {isMapReady && <NewsMarkers news={mapList} />}
        {isMapReady && <LocationHighlighter />}
        {isMapReady && <LocationMarker />}
        {isMapReady && <TopBar />}
        {/* {isMapReady && <MobileBottomBar />} */}
      </MapContainer>
    </div>
  );
}
