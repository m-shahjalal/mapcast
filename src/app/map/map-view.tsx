"use client";

import React, { useState, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { TopicItem, useMapContext } from "@/lib/map-context";
import { useMapUpdates } from "@/hooks/use-map-update";
import { NewsSelect } from "@/server/schemas";
import { TopBar } from "./components/top-bar";
import { NewsMarkers } from "./news-marker";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  topics: TopicItem[];
  news?: NewsSelect[];
  onTopicSelect?: (topic: TopicItem) => void;
}

function MapUpdater() {
  useMapUpdates();
  return null;
}

export function MapView({ topics, news = [], onTopicSelect }: MapViewProps) {
  const { center, zoom } = useMapContext();
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const handleTopicSelect = useCallback(
    (topic: TopicItem) => {
      setSelectedTopic(topic.label);
      onTopicSelect?.(topic);
    },
    [onTopicSelect]
  );

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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {isMapReady && (
          <NewsMarkers news={news} selectedTopic={selectedTopic} />
        )}

        {isMapReady && (
          <TopBar topics={topics} onTopicSelect={handleTopicSelect} />
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
