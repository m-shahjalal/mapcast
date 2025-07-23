"use client";
import { useMapUpdates } from "@/hooks/use-map-update";
import { useMapContext } from "@/lib/map-context";
import { NewsSelect } from "@/server/schemas";
import { useCallback, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { TopBar } from "./components/top-bar";
import { NewsMarkers } from "./news-marker";
import "leaflet/dist/leaflet.css";
import { MAP_LAYERS } from "@/lib/map-constraint";

function MapUpdater() {
  useMapUpdates();
  return null;
}

type LayerKey = keyof typeof MAP_LAYERS;

export function MapView({ news = [] }: { news?: NewsSelect[] }) {
  const { center, zoom, currentLayer, setCurrentLayer } = useMapContext();
  const [isMapReady, setIsMapReady] = useState(false);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const selectedLayer = MAP_LAYERS[currentLayer];

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
        <MapUpdater />

        <TileLayer
          key={currentLayer}
          attribution={selectedLayer.attribution}
          url={selectedLayer.url}
        />

        {isMapReady && <NewsMarkers news={news} />}
        {isMapReady && (
          <TopBar currentLayer={currentLayer} onLayerChange={setCurrentLayer} />
        )}
      </MapContainer>

      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  );
}
