"use client";
import { useEffect } from "react";
import { Circle, GeoJSON, useMap } from "react-leaflet";
import { useMapContext } from "@/config/map-context";
import L, { LatLngExpression } from "leaflet";

interface LocationHighlighterProps {
   circleColor?: string;
  fillColor?: string;
  fillOpacity?: number;
  radius?: number;
}

export function LocationHighlighter({
  circleColor = "#2563eb", 
  fillColor = "#3b82f6", 
  fillOpacity = 0.2,
  radius = 2000,
}: LocationHighlighterProps) {
  const map = useMap();
  const { country } = useMapContext();

  useEffect(() => {
    if (!country) return;

    try {
      const geoJsonLayer = L.geoJSON(country.geojson);
      map.fitBounds(geoJsonLayer.getBounds(), {
        padding: [20, 20],
        maxZoom: 14,
      });
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [country, map]);

  if (!country) return null;

  if (country.geojson) {
    return (
      <GeoJSON
        key={`geojson-${country.latitude}-${country.longitude}`}
        data={country.geojson}
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

  return (
    <Circle
      key={`circle-${country.latitude}-${country.longitude}`}
      center={
        [
          country.latitude as number,
          country.longitude as number,
        ] as LatLngExpression
      }
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
