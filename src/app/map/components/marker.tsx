"use client";

import { Sheet } from "@/components/ui/sheet";
import { cn, formatDate, truncateText } from "@/lib/utils";
import L from "leaflet";
import Link from "next/link";
import { memo, useMemo } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import { NewsReader } from "../news-reader";

interface LocationData {
  lat: string | number;
  lng?: string | number;
  lon?: string | number;
  name: string;
  address?: string;
  title?: string;
  summary?: string;
  source?: string;
  date?: Date | string;
  newsUrl?: string;
  slug?: string;
  topic?: string;
}

interface NewsMarkerProps {
  location: LocationData | null;
  color?: string;
  size?: "small" | "medium" | "large";
  emoji?: string;
}

const normalizeCoords = (location: LocationData): [number, number] | null => {
  const lat =
    typeof location.lat === "string"
      ? Number.parseFloat(location.lat)
      : location.lat;
  const lng = location.lng || location.lon;
  const lngNum = typeof lng === "string" ? Number.parseFloat(lng) : lng;
  if (!lat || !lngNum || isNaN(lat) || isNaN(lngNum)) return null;
  if (lat < -90 || lat > 90 || lngNum < -180 || lngNum > 180) return null;
  return [lat, lngNum];
};

const SIZES = {
  small: { width: 28, height: 28, emoji: 14 },
  medium: { width: 36, height: 36, emoji: 18 },
  large: { width: 44, height: 44, emoji: 22 },
} as const;

// Pre-defined CSS classes for better performance
const MARKER_STYLES = `
<style>
.marker-base {
  position: relative;
  border-radius: 50%;
  border: 2px solid white;
  cursor: pointer;
  transition: transform 0.2s ease;
  background: linear-gradient(135deg, var(--marker-color) 0%, var(--marker-color-90) 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.marker-base:hover {
  transform: scale(1.1);
  z-index: 1000;
}
.marker-emoji {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 1;
  user-select: none;
}
.marker-label {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 11px;
  color: #000;
  text-align: center;
  line-height: 1.2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 10;
  pointer-events: none;
}
.dark .marker-label {
  background: rgba(31, 41, 55, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
  color: #d1d5db;
}
.marker-small { width: 28px; height: 28px; }
.marker-medium { width: 36px; height: 36px; }
.marker-large { width: 44px; height: 44px; }
.emoji-small { font-size: 14px; }
.emoji-medium { font-size: 18px; }
.emoji-large { font-size: 22px; }
</style>`;

// Memoized icon creation with simpler structure
const createOptimizedIcon = (
  color = "#3b82f6",
  size: "small" | "medium" | "large" = "medium",
  emoji = "📰",
  title = ""
) => {
  const { width, height } = SIZES[size];
  const colorWithAlpha = color + "e6"; // 90% opacity

  return L.divIcon({
    className: "optimized-marker",
    html: `
      ${MARKER_STYLES}
      <div class="marker-base marker-${size}" style="--marker-color: ${color}; --marker-color-90: ${colorWithAlpha};">
        <div class="marker-emoji emoji-${size}">${emoji}</div>
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
    tooltipAnchor: [0, -height / 2 - 8],
  });
};

// Separate component for tooltip content to avoid re-renders
const TooltipContent = memo<{ location: LocationData }>(({ location }) => {
  const displayTitle = location.title || location.name;
  const formattedDate = formatDate(location.date);

  return (
    <div className="space-y-2">
      <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
        {truncateText(displayTitle, 25)}
      </div>
      <div className="space-y-1">
        {location.source && (
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <span>📰</span>
            <span className="truncate">
              {truncateText(location.source, 15)}
            </span>
          </div>
        )}
        {formattedDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span>📅</span>
            <span>{formattedDate}</span>
          </div>
        )}
      </div>
    </div>
  );
});

TooltipContent.displayName = "TooltipContent";

// Separate component for popup content
const PopupContent = memo<{
  location: LocationData;
  color: string;
  emoji: string;
}>(({ location, color, emoji }) => {
  const displayTitle = location.title || location.name;
  const formattedDate = formatDate(location.date);
  const hasDetails =
    location.address || location.summary || location.source || formattedDate;

  return (
    <Sheet>
      <div className="leading-relaxed font-sans my-4 text-gray-900 dark:text-gray-100">
        <div
          className={cn(
            "flex items-center gap-2 font-bold text-sm leading-tight",
            hasDetails && "mb-3"
          )}
        >
          <span className="text-lg">{emoji}</span>
          <span className="flex-1 min-w-0">{displayTitle}</span>
        </div>

        {location.summary && (
          <div
            className="text-xs text-gray-600 dark:text-gray-300 mb-3 px-2 border-l-2 rounded py-1 leading-relaxed bg-gray-50 dark:bg-gray-800/50"
            style={{ borderColor: color }}
          >
            {truncateText(location.summary, 100)}
          </div>
        )}

        {hasDetails && (
          <div className="grid gap-1.5 p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 mb-3">
            {location.newsUrl && (
              <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300 min-w-0">
                <span>📰</span>
                <Link
                  href={location.newsUrl}
                  className="truncate min-w-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  {location.newsUrl}
                </Link>
              </div>
            )}
            {formattedDate && (
              <div className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                <span>📅</span>
                <span>{formattedDate}</span>
              </div>
            )}
            {location.address && (
              <div className="flex items-start gap-1 text-xs text-gray-700 dark:text-gray-300 leading-tight">
                <span className="mt-0.5">📍</span>
                <span className="break-words">{location.address}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <NewsReader
        url={location.newsUrl ?? ""}
        color={color}
        title={location.title}
      />
    </Sheet>
  );
});

PopupContent.displayName = "PopupContent";

export const NewsMarker = memo<NewsMarkerProps>(
  ({ location, color = "#3b82f6", size = "medium", emoji = "📰" }) => {
    const position = useMemo(() => {
      if (!location) return null;
      return normalizeCoords(location);
    }, [location]);

    const icon = useMemo(
      () => createOptimizedIcon(color, size, emoji, location?.title),
      [color, size, emoji, location?.title]
    );

    if (!location || !position) {
      if (location) {
        console.warn("Invalid coordinates for location:", location);
      }
      return null;
    }

    return (
      <Marker position={position} icon={icon}>
        <Tooltip
          direction="top"
          offset={[0, -12]}
          className="!rounded !p-2 border border-gray-200 dark:!border-gray-700 bg-white dark:!bg-gray-800 shadow-lg"
          permanent={false}
        >
          <TooltipContent location={location} />
        </Tooltip>

        <Popup
          className="transition-all ease-in-out duration-300"
          minWidth={180}
          maxWidth={280}
          closeButton={true}
        >
          <PopupContent location={location} color={color} emoji={emoji} />
        </Popup>
      </Marker>
    );
  }
);

NewsMarker.displayName = "NewsMarker";
