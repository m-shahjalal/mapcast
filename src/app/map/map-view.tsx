"use client";

import React, { useState, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { TopicItem, useMapContext } from "@/lib/map-context";
import { useMapUpdates } from "@/hooks/use-map-update";
import { FancyMarker } from "./components/marker";
import { TopBar } from "./components/top-bar";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  topics: TopicItem[];
  onTopicSelect?: (topic: TopicItem) => void;
}

function MapUpdater() {
  useMapUpdates();
  return null;
}

export function MapView({ topics, onTopicSelect }: MapViewProps) {
  const { center, zoom, selectedLocation } = useMapContext();
  const [isMapReady, setIsMapReady] = useState(false);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={false}
        whenReady={handleMapReady}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <MapUpdater />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FancyMarker location={selectedLocation} color="#3b82f6" />

        {isMapReady && <TopBar topics={topics} onTopicSelect={onTopicSelect} />}
      </MapContainer>

      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  );
}
