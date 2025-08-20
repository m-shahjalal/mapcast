"use client";
import { useEffect } from "react";
import { Circle, GeoJSON, useMap } from "react-leaflet";
import { useMapContext } from "@/config/map-context";
import L from "leaflet";

interface LocationHighlighterProps {
  // Optional: you can pass additional styling props
  circleColor?: string;
  fillColor?: string;
  fillOpacity?: number;
  radius?: number;
}

export function LocationHighlighter({
  circleColor = "#2563eb", // Professional blue
  fillColor = "#3b82f6", // Slightly lighter blue for fill
  fillOpacity = 0.2,
  radius = 2000,
}: LocationHighlighterProps) {
  const map = useMap();
  const { selectedLocation } = useMapContext();

  useEffect(() => {
    if (!selectedLocation) return;

    // Fit bounds if geojson boundary is available
    if ((selectedLocation as any)?.geojson) {
      try {
        const geoJsonLayer = L.geoJSON((selectedLocation as any).geojson);
        map.fitBounds(geoJsonLayer.getBounds(), {
          padding: [20, 20],
          maxZoom: 14,
        });
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }
  }, [selectedLocation, map]);

  if (!selectedLocation) return null;

  // If we have geojson boundary data, use it
  if ((selectedLocation as any).geojson) {
    return (
      <GeoJSON
        key={`geojson-${selectedLocation.latitude}-${selectedLocation.longitude}`}
        data={(selectedLocation as any).geojson}
        style={{
          color: circleColor,
          weight: 3,
          opacity: 0.8,
          fillColor,
          fillOpacity,
        }}
      />
    );
  }

  // Fallback to circle if no boundary data
  return (
    <Circle
      key={`circle-${selectedLocation.latitude}-${selectedLocation.longitude}`}
      center={[
        parseFloat(selectedLocation.latitude ?? "0"),
        parseFloat(selectedLocation.longitude ?? "0"),
      ]}
      radius={radius}
      pathOptions={{
        color: circleColor,
        weight: 2,
        opacity: 0.8,
        fillColor,
        fillOpacity,
      }}
    />
  );
}
