"use client";
import { MAP_LAYERS } from "@/config/map-constraint";
import { useMapContext } from "@/config/map-context";
import { cn } from "@/lib/utils";
import { NewsType } from "@/server/database/schemas";
import L, { LatLngExpression } from "leaflet";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

const createDefaultIcon = (): L.Icon => {
  return L.icon({
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const MapOverLay = () => {
  const router = useRouter();
  useMapEvents({ click: router.back });

  return (
    <div
      className="absolute right-0 left-0 top-0 bottom-0 z-[999] w-full h-full bg-gray-800/60 flex justify-center items-center"
      onClick={router.back}
    >
      <ArrowLeftIcon className="w-40 h-40 opacity-40" />
    </div>
  );
};

export const NewsViewer = ({
  news,
  className,
}: {
  news: NewsType;
  className?: string;
}) => {
  const { currentLayer, zoom } = useMapContext();

  const position = [
    parseFloat(news.latitude ?? "0"),
    parseFloat(news.longitude ?? "0"),
  ] as LatLngExpression;

  return (
    <div className={cn("relative w-full h-full", className)}>
      <MapContainer
        center={position}
        minZoom={3}
        zoom={zoom}
        className="h-full w-full cursor-pointer border border-red-300"
        zoomControl={false}
        maxZoom={18}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        maxBoundsViscosity={1.0}
      >
        <MapOverLay />
        <Marker position={position} icon={createDefaultIcon()} />
        <TileLayer key={currentLayer} url={MAP_LAYERS[currentLayer].url} />
      </MapContainer>
    </div>
  );
};
