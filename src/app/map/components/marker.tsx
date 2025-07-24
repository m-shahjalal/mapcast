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
  pulseAnimation?: boolean;
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
  small: { width: 28, height: 28, emoji: 14, shadow: 8 },
  medium: { width: 36, height: 36, emoji: 18, shadow: 12 },
  large: { width: 44, height: 44, emoji: 22, shadow: 16 },
} as const;

const createEnhancedIcon = (
  color = "#3b82f6",
  size: "small" | "medium" | "large" = "medium",
  pulseAnimation = true,
  emoji = "📰",
  title = ""
) => {
  const { width, height, emoji: emojiSize, shadow } = SIZES[size];
  const pulseKeyframes = pulseAnimation
    ? `
    @keyframes markerPulse {
      0% {         box-shadow: 0 ${
        shadow / 3
      }px ${shadow}px rgba(0,0,0,0.2), 0 0 0 0 var(--marker-color-40);       }
      70% {         box-shadow: 0 ${
        shadow / 3
      }px ${shadow}px rgba(0,0,0,0.2), 0 0 0 ${
        shadow * 1.2
      }px transparent;       }
      100% {         box-shadow: 0 ${
        shadow / 3
      }px ${shadow}px rgba(0,0,0,0.2), 0 0 0 0 transparent;       }
    }
    `
    : "";
  const animationStyle = pulseAnimation
    ? "animation: markerPulse 3s infinite;"
    : "";

  return L.divIcon({
    className: "enhanced-marker-custom",
    html: `
      <div class="marker-container" style="
        --marker-color: ${color};
        --marker-color-light: ${color}cc;
        --marker-color-30: ${color}30;
        --marker-color-40: ${color}40;
        width: ${width}px;
        height: ${height}px;
        position: relative;
        border-radius: 9999px;
        border: 3px solid white;
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: linear-gradient(135deg, var(--marker-color) 0%, var(--marker-color-light) 100%);
        box-shadow: 0 ${shadow / 3}px ${shadow}px rgba(0,0,0,0.15);
        ${animationStyle}
      ">
        <div class="marker-emoji" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: ${emojiSize}px;
          line-height: 1;
          user-select: none;
          transition: all 0.2s ease;
        ">${emoji}</div>
        <div class="marker-ring" style="
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px solid var(--marker-color-30);
          border-radius: 50%;
          opacity: 0;
          transition: all 0.3s ease;
        ">
        </div>
        
      </div>
      <div style="
          margin-top: -20px;
          margin-left: -60px;
          background: rgba(255, 255, 255, 0.70);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 6px;
          padding: 5px 8px;
          font-size: 12px;
          color: #000;
          text-align: center;
          line-height: 1.2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          min-width: 150px;
          transition: all 0.3s ease;
          overflow: hidden;
          text-overflow: ellipsis;
        ">${truncateText(title, 20)}</div>
      <style>${pulseKeyframes}
        .marker-container:hover {
          transform: translate(-50%, -50%) scale(1.15) !important;
          animation: bounce 0.6s ease-in-out !important;
          z-index: 1000 !important;
        }
        .marker-container:hover .marker-ring {
          opacity: 1 !important;
          transform: scale(1.2) !important;
        }
        .marker-container:hover .marker-emoji {
          transform: translate(-50%, -50%) scale(1.1) !important;
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate(-50%, -50%) scale(1.15); }
          40%, 43% { transform: translate(-50%, -50%) scale(1.25); }
        }
      </style>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
    popupAnchor: [0, -height / 2 - 8],
    tooltipAnchor: [0, -height / 2 - 8],
  });
};

export const NewsMarker = memo<NewsMarkerProps>(
  ({
    location,
    color = "#3b82f6",
    size = "medium",
    pulseAnimation = true,
    emoji = "📰",
  }) => {
    const position = useMemo(() => {
      if (!location) return null;
      return normalizeCoords(location);
    }, [location]);

    const icon = createEnhancedIcon(
      color,
      size,
      pulseAnimation,
      emoji,
      location?.title
    );

    if (!location || !position) {
      if (location) {
        console.warn("Invalid coordinates for location:", location);
      }
      return null;
    }

    const displayTitle = location.title || location.name;
    const formattedDate = formatDate(location.date);
    const hasDetails =
      location.address || location.summary || location.source || formattedDate;

    return (
      <Marker position={position} icon={icon}>
        <Tooltip
          direction="top"
          offset={[0, -12]}
          className="shadow-lg rounded-lg p-2 border"
          permanent={false}
        >
          <div className="space-y-2">
            <div className="text-lg font-medium text-gray-900">
              {truncateText(displayTitle, 30)}
            </div>
            <div className="space-y-1">
              {location.source && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <span className="flex-shrink-0">📰</span>
                  <span className="truncate">
                    {truncateText(location.newsUrl ?? "", 20)}
                  </span>
                </div>
              )}
              {formattedDate && (
                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <span className="flex-shrink-0">📅</span>
                  <span>{formattedDate}</span>
                </div>
              )}
            </div>
          </div>
        </Tooltip>
        <Popup
          minWidth={200}
          maxWidth={320}
          className="p-0! m-0!"
          closeButton={true}
        >
          <Sheet>
            <div className="popup-content leading-relaxed font-sans my-6">
              <div
                className={cn(
                  "flex items-center gap-2 font-bold text-base text-gray-900 leading-tight",
                  hasDetails && "mb-3"
                )}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="flex-1 min-w-0">{displayTitle}</span>
              </div>
              {location.summary && (
                <div
                  className="summary-box text-sm text-gray-600 mb-3.5 px-2.5 border-l-4 rounded py-1 leading-relaxed my-6"
                  style={{ borderColor: color }}
                >
                  {truncateText(location.summary, 120)}
                </div>
              )}
              {hasDetails && (
                <div className="details-grid grid gap-2 p-3 bg-slate-50 rounded-lg border mb-4 mt-6">
                  {location.newsUrl && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium min-w-0">
                      <span className="flex-shrink-0">📰</span>
                      <Link
                        href={location.newsUrl}
                        className="news-link truncate min-w-0 transition-colors"
                      >
                        {location.newsUrl}
                      </Link>
                    </div>
                  )}
                  {formattedDate && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                      <span className="flex-shrink-0 w-4">📅</span>
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {location.address && (
                    <div className="flex items-start gap-1.5 text-sm text-gray-700 font-medium leading-tight">
                      <span className="flex-shrink-0 w-4 mt-0.5">📍</span>
                      <span className="whitespace-pre-wrap break-words">
                        {location.address}
                      </span>
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
        </Popup>
      </Marker>
    );
  }
);

NewsMarker.displayName = "NewsMarker";
