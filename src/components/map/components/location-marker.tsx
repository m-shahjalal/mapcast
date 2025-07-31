import { memo, useMemo } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import { useMapContext } from "@/config/map-context";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Create a custom icon for selected location
const createLocationIcon = (color = "#ef4444", size = 40) => {
  return L.divIcon({
    className: "location-marker",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: none;
        position: absolute;
        cursor: pointer;
        right: -10px;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          color: white;
          font-size: ${size * 0.4}px;
          font-weight: bold;
        ">📍</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    tooltipAnchor: [0, -size],
  });
};

export const LocationMarker = memo(() => {
  const { selectedLocation } = useMapContext();

  const icon = useMemo(() => createLocationIcon("blue", 40), []);

  if (!selectedLocation) return null;

  return (
    <Marker
      position={[selectedLocation.lat, selectedLocation.lng]}
      icon={icon}
      zIndexOffset={1000}
    >
      <Tooltip
        direction="top"
        offset={[0, -40]}
        className="!rounded !p-2 border border-gray-200 dark:!border-gray-700 bg-white dark:!bg-gray-800 shadow-lg"
        permanent={false}
      >
        <div className="space-y-1">
          <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {selectedLocation.name}
          </div>
          {selectedLocation.address && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {selectedLocation.address}
            </div>
          )}
        </div>
      </Tooltip>

      <Popup
        className="transition-all ease-in-out duration-300"
        minWidth={200}
        maxWidth={300}
        closeButton={true}
      >
        <div className="p-2">
          <div className="flex items-center gap-2 font-bold text-sm mb-2">
            <span className="text-red-500">📍</span>
            <span>{selectedLocation.name}</span>
          </div>

          {selectedLocation.address && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {selectedLocation.address}
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Coordinates: {selectedLocation.lat.toFixed(4)},{" "}
            {selectedLocation.lng.toFixed(4)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
});

LocationMarker.displayName = "LocationMarker";
