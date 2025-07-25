import { useMapContext } from "@/lib/map-context";
import { useCallback, useEffect } from "react";
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
    const handleLocationFound = (e: any) => {
      setZoom(map.getZoom());

      // Clean up event listeners
      map.off("locationfound", handleLocationFound);
      map.off("locationerror", handleLocationError);
    };

    const handleLocationError = (e: any) => {
      alert(`Location access denied: ${e.message}`);

      map.off("locationfound", handleLocationFound);
      map.off("locationerror", handleLocationError);
    };

    map.on("locationfound", handleLocationFound);
    map.on("locationerror", handleLocationError);

    console.log("locate user", map);

    map.locate({
      setView: true,
      maxZoom: 16,
      enableHighAccuracy: true,
      timeout: 10_000,
    });
  }, [map, setZoom]);

  useEffect((): void | (() => void) => {
    if (!map) return;

    const handleZoomEnd = () => {
      setZoom(map.getZoom());
    };

    map.on("zoomend", handleZoomEnd);
    return () => map.off("zoomend", handleZoomEnd);
  }, [map, setZoom]);

  return { zoomIn, zoomOut, locateUser };
}
