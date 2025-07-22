import { useMapContext } from "@/lib/map-context";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function useMapUpdates() {
  const map = useMap();
  const { setZoom } = useMapContext();

  useEffect((): void | (() => void) => {
    if (!map) return;

    const handleZoomEnd = () => {
      setZoom(map.getZoom());
    };

    map.on("zoomend", handleZoomEnd);
    return () => map.off("zoomend", handleZoomEnd);
  }, [map, setZoom]);

  return null;
}
