import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { memo } from "react";

// Types
interface LocationData {
  lat: string | number;
  lng?: string | number;
  lon?: string | number;
  name: string;
  address?: string;
}

interface FancyMarkerProps {
  location: LocationData | null;
  color?: string;
}

const normalizeCoords = (location: LocationData): [number, number] | null => {
  const lat =
    typeof location.lat === "string" ? parseFloat(location.lat) : location.lat;
  const lng = location.lng || location.lon;
  const lngNum = typeof lng === "string" ? parseFloat(lng) : lng;

  if (!lat || !lngNum || isNaN(lat) || isNaN(lngNum)) {
    return null;
  }

  return [lat, lngNum];
};

const createFancyIcon = (color: string = "#3b82f6") => {
  return L.divIcon({
    className: "fancy-marker",
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
        animation: pulse 2s infinite;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 ${color}40; }
          70% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 10px transparent; }
          100% { box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 0 transparent; }
        }
      </style>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export const FancyMarker = memo<FancyMarkerProps>(
  ({ location, color = "#3b82f6" }) => {
    if (!location) return null;
    const position = normalizeCoords(location);

    if (!position) {
      console.warn("Invalid coordinates for location:", location);
      return null;
    }

    return (
      <Marker position={position} icon={createFancyIcon(color)}>
        <Popup className="fancy-popup" minWidth={120} maxWidth={250}>
          <div style={{ padding: "4px 0" }}>
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>
              {location.name}
            </div>
            {location.address && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                {location.address}
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    );
  }
);
