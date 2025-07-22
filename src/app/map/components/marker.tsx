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

interface FancyMarkerProps {
  location: LocationData | null;
  color?: string;
  showTooltip?: boolean;
  size?: "small" | "medium" | "large";
  pulseAnimation?: boolean;
  emoji?: string;
  onLinkClick?: (url: string) => void;
}

// Coordinate validation and normalization
const normalizeCoords = (location: LocationData): [number, number] | null => {
  const lat =
    typeof location.lat === "string" ? parseFloat(location.lat) : location.lat;
  const lng = location.lng || location.lon;
  const lngNum = typeof lng === "string" ? parseFloat(lng) : lng;

  if (!lat || !lngNum || isNaN(lat) || isNaN(lngNum)) {
    return null;
  }

  if (lat < -90 || lat > 90 || lngNum < -180 || lngNum > 180) {
    return null;
  }

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
  return text.substring(0, maxLength).trim() + "...";
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
      <div class="marker-container" style="
        position: relative;
        width: ${width}px;
        height: ${height}px;
        background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        ${animationStyle}
        box-shadow: 0 ${shadow / 3}px ${shadow}px rgba(0,0,0,0.15);
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
          border: 2px solid ${color}30;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.3s ease;
        "></div>
      </div>
      <style>
        ${pulseKeyframes}
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
      </style>
    `,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
    popupAnchor: [0, -height / 2 - 8],
    tooltipAnchor: [0, -height / 2 - 8],
  });
};

export const FancyMarker = memo<FancyMarkerProps>(
  ({
    location,
    color = "#3b82f6",
    showTooltip = true,
    size = "medium",
    pulseAnimation = true,
    emoji = "📰",
    onLinkClick,
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
          <div>
            <div className="text-lg mb-4">{truncateText(displayTitle, 30)}</div>

            <div>
              {location.source && (
                <div>
                  <span>📰</span> {truncateText(location.newsUrl ?? "", 20)}
                </div>
              )}

              {formattedDate && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>📅</span> {formattedDate}
                </div>
              )}
            </div>
          </div>
        </Tooltip>

        <Popup minWidth={200} maxWidth={320} closeButton={true}>
          <div
            style={{
              padding: "14px 10px",
              lineHeight: "1.5",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              background: "rgba(255, 255, 255, 0.98)",
            }}
          >
            <div
              style={{
                fontWeight: "700",
                fontSize: "16px",
                marginBottom: hasDetails ? "12px" : "0",
                color: "#111827",
                lineHeight: "1.3",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px" }}>{emoji}</span>
              <span>{displayTitle}</span>
            </div>

            {location.summary && (
              <div
                style={{
                  fontSize: "14px",
                  color: "#4b5563",
                  marginBottom: "14px",
                  lineHeight: "1.4",
                  padding: "10px",
                  background: "#f9fafb",
                  borderLeft: `3px solid ${color}`,
                  borderRadius: "0 6px 6px 0",
                }}
              >
                {truncateText(location.summary, 120)}
              </div>
            )}

            {hasDetails && (
              <div
                style={{
                  display: "grid",
                  gap: "8px",
                  marginBottom:
                    location.newsUrl || location.slug ? "16px" : "0",
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: `1px solid ${color}15`,
                }}
              >
                {location.newsUrl && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#374151",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: "500",
                    }}
                  >
                    <span style={{ minWidth: "16px" }}>📰</span>
                    <span className="truncate w-2/3 overflow-hidden">
                      <Link href={location.newsUrl}>{location.newsUrl}</Link>
                    </span>
                  </div>
                )}

                {formattedDate && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#374151",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: "500",
                    }}
                  >
                    <span style={{ minWidth: "16px" }}>📅</span>
                    <span>{formattedDate}</span>
                  </div>
                )}

                {location.address && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#374151",
                      lineHeight: "1.3",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "6px",
                      fontWeight: "500",
                    }}
                  >
                    <span style={{ minWidth: "16px", marginTop: "1px" }}>
                      📍
                    </span>
                    <span className="whitespace-pre-wrap w-3xs">
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
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: `0 2px 8px ${color}40`,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 4px 16px ${color}50`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 2px 8px ${color}40`;
                }}
              >
                <span style={{ fontSize: "16px" }}>📖</span>
                <span>Read Full Story</span>
              </button>
            )}
          </div>
        </Popup>
      </Marker>
    );
  }
);
