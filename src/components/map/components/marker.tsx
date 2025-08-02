"use client";

import { Sheet } from "@/components/ui/sheet";
import { cn, formatDate, truncateText } from "@/lib/utils";
import L from "leaflet";
import Link from "next/link";
import { memo, useMemo } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import { NewsReader } from "../news-reader";
import { LocationData } from "@/config/map-context";

interface NewsMarkerProps {
  location: LocationData | null;
  color?: string;
  size?: "small" | "medium" | "large";
  emoji?: string;
}

// Consolidated constants
const CONFIG = {
  sizes: {
    small: { width: 28, height: 28, fontSize: 14 },
    medium: { width: 36, height: 36, fontSize: 18 },
    large: { width: 44, height: 44, fontSize: 22 },
  },
  styles: `
    .marker-base { position: relative; border-radius: 50%; border: 2px solid white; cursor: pointer; transition: transform 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .marker-base:hover { transform: scale(1.1); z-index: 1000; }
    .marker-emoji { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); line-height: 1; user-select: none; }
    .marker-label { position: absolute; top: -35px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 8px 12px; font-size: 11px; color: #000; text-align: center; line-height: 1.2; box-shadow: 0 2px 4px rgba(0,0,0,0.1); white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis; z-index: 10; pointer-events: none; }
    .dark .marker-label { background: rgba(31,41,55,0.95); border-color: rgba(255,255,255,0.1); color: #d1d5db; }
  `,
} as const;

// Utility functions
const normalizeCoords = (location: LocationData): [number, number] | null => {
  const lat =
    typeof location.lat === "string" ? parseFloat(location.lat) : location.lat;
  const lng =
    typeof location.lng === "string" ? parseFloat(location.lng) : location.lng;

  if (
    !lat ||
    !lng ||
    isNaN(lat) ||
    isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  )
    return null;

  return [lat, lng];
};

const createIcon = (
  color: string,
  size: keyof typeof CONFIG.sizes,
  emoji: string,
  title?: string
): L.DivIcon => {
  const { width, height, fontSize } = CONFIG.sizes[size];

  return L.divIcon({
    className: "news-marker",
    html: `
      <style>${CONFIG.styles}</style>
      <div class="marker-base" style="width:${width}px;height:${height}px;background:linear-gradient(135deg,${color} 0%,${color}e6 100%);">
        <div class="marker-emoji" style="font-size:${fontSize}px">${emoji}</div>
        ${
          title
            ? `<div class="marker-label">${truncateText(title, 15)}</div>`
            : ""
        }
      </div>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
    popupAnchor: [0, -height / 2 - 8],
  });
};

// Content components
const TooltipContent = memo<{ location: LocationData }>(({ location }) => (
  <div className="space-y-2">
    <div className="font-semibold text-sm">
      {truncateText(location.headline || location.name, 25)}
    </div>
    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
      {location.source && (
        <div className="flex items-center gap-1">
          <span>📰</span>
          <span className="truncate">{truncateText(location.source, 15)}</span>
        </div>
      )}
      {location.date && (
        <div className="flex items-center gap-1">
          <span>📅</span>
          <span>{formatDate(location.date)}</span>
        </div>
      )}
    </div>
  </div>
));

const PopupContent = memo<{
  location: LocationData;
  color: string;
  emoji: string;
}>(({ location, color, emoji }) => {
  const title = location.headline || location.name;
  const date = formatDate(location.date);

  return (
    <Sheet>
      <div className="my-4 text-sm">
        <div className="flex items-center gap-2 font-bold mb-3">
          <span className="text-lg">{emoji}</span>
          <span className="flex-1">{title}</span>
        </div>

        {location.summary && (
          <div
            className="text-xs p-2 mb-3 border-l-2 rounded bg-gray-50 dark:bg-gray-800/50"
            style={{ borderColor: color }}
          >
            {truncateText(location.summary, 100)}
          </div>
        )}

        <div className="grid gap-1.5 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border mb-3 text-xs">
          {location.link && (
            <div className="flex items-center gap-1 min-w-0">
              <span className="flex-shrink-0">📰</span>
              <Link
                href={location.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate min-w-0 block"
              >
                {truncateText(location.link.replace(/^https?:\/\//, ""), 30)}
              </Link>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-1">
              <span className="flex-shrink-0">📅</span>
              <span>{date}</span>
            </div>
          )}
          {location.address && (
            <div className="flex items-start gap-1 min-w-0">
              <span className="flex-shrink-0 mt-0.5">📍</span>
              <span className="break-words min-w-0">{location.address}</span>
            </div>
          )}
        </div>
      </div>

      <NewsReader
        url={location.link ?? ""}
        color={color}
        title={location.headline}
      />
    </Sheet>
  );
});

export const NewsMarker = memo<NewsMarkerProps>(
  ({ location, color = "#3b82f6", size = "medium", emoji = "📰" }) => {
    const position = useMemo(
      () => location && normalizeCoords(location),
      [location]
    );
    const icon = useMemo(
      () =>
        position
          ? createIcon(color, size, emoji, location?.headline)
          : undefined,
      [color, size, emoji, location?.headline, position]
    );

    if (!location || !position || !icon) {
      location && console.warn("Invalid coordinates:", location);
      return null;
    }

    return (
      <Marker position={position} icon={icon}>
        <Tooltip
          direction="top"
          offset={[0, -12]}
          className="!p-2 !rounded shadow-lg"
        >
          <TooltipContent location={location} />
        </Tooltip>
        <Popup minWidth={180} maxWidth={280}>
          <PopupContent location={location} color={color} emoji={emoji} />
        </Popup>
      </Marker>
    );
  }
);

NewsMarker.displayName = "NewsMarker";
