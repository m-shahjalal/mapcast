import { useMapContext } from "@/lib/map-context";
import { useCallback } from "react";
import { useMap } from "react-leaflet";

export function useMapControls() {
  const map = useMap();
  const { setZoom } = useMapContext();

  const zoomIn = useCallback(() => {
    const newZoom = Math.min(map.getZoom() + 1, map.getMaxZoom());
    map.setZoom(newZoom);
    setZoom(newZoom);
  }, [map, setZoom]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(map.getZoom() - 1, map.getMinZoom());
    map.setZoom(newZoom);
    setZoom(newZoom);
  }, [map, setZoom]);

  const locateUser = useCallback(() => {
    map.locate({ setView: true, maxZoom: 16 });

    const handleLocationFound = (e: any) => {
      setZoom(map.getZoom());
      map.off("locationfound", handleLocationFound);
    };

    const handleLocationError = (e: any) => {
      alert(`Location access denied: ${e.message}`);
      map.off("locationerror", handleLocationError);
    };

    map.on("locationfound", handleLocationFound);
    map.on("locationerror", handleLocationError);
  }, [map, setZoom]);

  return { zoomIn, zoomOut, locateUser };
}
