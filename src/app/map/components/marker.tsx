import { Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import { memo, useMemo } from "react";
import Link from "next/link";

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

// Coordinate validation and normalization
const normalizeCoords = (location: LocationData): [number, number] | null => {
  const lat =
    typeof location.lat === "string" ? parseFloat(location.lat) : location.lat;
  const lng = location.lng || location.lon;
  const lngNum = typeof lng === "string" ? parseFloat(lng) : lng;

  if (!lat || !lngNum || isNaN(lat) || isNaN(lngNum)) return null;
  if (lat < -90 || lat > 90 || lngNum < -180 || lngNum > 180) return null;

  return [lat, lngNum];
};

// Size configurations
const SIZES = {
  small: { width: 28, height: 28, emoji: 14, shadow: 8 },
  medium: { width: 36, height: 36, emoji: 18, shadow: 12 },
  large: { width: 44, height: 44, emoji: 22, shadow: 16 },
} as const;

// Format date helper
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Truncate text helper
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
};

const createEnhancedIcon = (
  color: string = "#3b82f6",
  size: "small" | "medium" | "large" = "medium",
  pulseAnimation: boolean = true,
  emoji: string = "📰"
) => {
  const { width, height, emoji: emojiSize, shadow } = SIZES[size];

  const pulseKeyframes = pulseAnimation
    ? `
    @keyframes markerPulse {
      0% { 
        box-shadow: 0 ${
          shadow / 3
        }px ${shadow}px rgba(0,0,0,0.2), 0 0 0 0 ${color}40; 
      }
      70% { 
        box-shadow: 0 ${shadow / 3}px ${shadow}px rgba(0,0,0,0.2), 0 0 0 ${
        shadow * 1.2
      }px transparent; 
      }
      100% { 
        box-shadow: 0 ${
          shadow / 3
        }px ${shadow}px rgba(0,0,0,0.2), 0 0 0 0 transparent; 
      }
    }
    `
    : "";

  const animationStyle = pulseAnimation
    ? "animation: markerPulse 3s infinite;"
    : "";

  return L.divIcon({
    className: "enhanced-marker-custom",
    html: `
      <div class="marker-container relative bg-gradient-to-br rounded-full border-white border-4 cursor-pointer transition-all duration-300 ease-out shadow-lg hover:scale-115 hover:z-[1000]" style="
        width: ${width}px;
        height: ${height}px;
        background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);
        transform: translate(-50%, -50%);
        ${animationStyle}
      ">
        <div class="marker-emoji absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none transition-all duration-200 hover:scale-110" style="
          font-size: ${emojiSize}px;
          line-height: 1;
        ">${emoji}</div>
        <div class="marker-ring absolute -inset-0.5 border-2 rounded-full opacity-0 transition-all duration-300 hover:opacity-100 hover:scale-120" style="
          border-color: ${color}30;
        "></div>
      </div>
      <style>
        ${pulseKeyframes}
        .marker-container:hover {
          animation: bounce 0.6s ease-in-out !important;
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

    const icon = createEnhancedIcon(color, size, pulseAnimation, emoji);

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
          className="!shadow-lg !rounded-lg !p-2 !border"
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

        <Popup minWidth={200} maxWidth={320} closeButton={true}>
          <div className="p-3.5 leading-relaxed font-sans bg-gradient-to-br from-white to-gray-50">
            {/* Header */}
            <div
              className={`flex items-center gap-2 font-bold text-base text-gray-900 leading-tight ${
                hasDetails ? "mb-3" : ""
              }`}
            >
              <span className="text-lg">{emoji}</span>
              <span className="flex-1 min-w-0">{displayTitle}</span>
            </div>

            {/* Summary */}
            {location.summary && (
              <div
                className="text-sm text-gray-600 mb-3.5 p-2.5 bg-gray-50 rounded-r-md leading-relaxed"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                {truncateText(location.summary, 120)}
              </div>
            )}

            {/* Details Grid */}
            {hasDetails && (
              <div
                className="grid gap-2 p-3 bg-slate-50 rounded-lg border mb-4"
                style={{ borderColor: `${color}15` }}
              >
                {location.newsUrl && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium min-w-0">
                    <span className="flex-shrink-0">📰</span>
                    <Link
                      href={location.newsUrl}
                      className="truncate min-w-0 hover:text-blue-600 transition-colors"
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

            {/* Action Button */}
            {(location.newsUrl || location.slug) && (
              <button
                onClick={() => (window.location.href = location.newsUrl ?? "")}
                className="w-full px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                  boxShadow: `0 2px 8px ${color}40`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 4px 16px ${color}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 2px 8px ${color}40`;
                }}
              >
                <span className="text-base">📖</span>
                <span>Read Full Story</span>
              </button>
            )}
          </div>
        </Popup>
      </Marker>
    );
  }
);

NewsMarker.displayName = "Marker";
