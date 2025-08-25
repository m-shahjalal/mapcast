"use client";
import { MAP_LAYERS } from "@/config/map-constraint";
import { useMapContext } from "@/config/map-context";
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
      className="absolute right-0 left-0 top-0 bottom-0 z-[999] w-full h-full bg-gray-800/70 flex justify-center items-center cursor-pointer hover:bg-gray-800/50 transition-all"
      onClick={router.back}
    >
      <ArrowLeftIcon className="w-28 h-28 opacity-40 absolute top-8 left-4" />
    </div>
  );
};

export const MapViewer = ({ news }: { news: NewsType }) => {
  const { currentLayer, zoom } = useMapContext();

  const position = [news.latitude, news.longitude] as LatLngExpression;

  return (
    <div className="w-full h-full sticky top-0">
      <MapContainer
        center={position}
        className="w-full h-full"
        minZoom={3}
        zoom={zoom}
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
