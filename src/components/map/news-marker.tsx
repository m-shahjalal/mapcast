"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMapContext } from "@/config/map-context";
import { formatDate, truncateText } from "@/utils/cn";
import type { NewsType } from "@/server/database/schemas";
import { newsTopicDropdown } from "@/shared/enum-list";
import { getPositon } from "@/utils/urls";
import L, { type LatLngExpression } from "leaflet";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useMemo } from "react";
import { Marker, Popup } from "react-leaflet";

const MARKER_SIZE = 40;
const EMOJI_SIZE = 20;

const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const createIcon = (color: string, emoji: string, text: string): L.DivIcon => {
  const colorHash = color.replace("#", "").replace(/[^a-zA-Z0-9]/g, "");
  const uniqueClass = `enhanced-marker-${colorHash}`;

  const lighterColor = adjustColor(color, 40);
  const darkerColor = adjustColor(color, -20);
  const shadowColor = adjustColor(color, -40);

  return L.divIcon({
    className: `enhanced-marker-custom ${uniqueClass}`,
    html: `
      <style>
        .${uniqueClass} .marker-container {
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          cursor: pointer !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          z-index: 100 !important;
        }
        
        /* Ensure parent marker icon has proper positioning */
        .${uniqueClass} {
          position: relative !important;
          z-index: 100 !important;
        }
        
        .${uniqueClass} .marker-text {
          background: linear-gradient(135deg, ${lighterColor} 0%, ${color} 50%, ${darkerColor} 100%) !important;
          color: white !important;
          padding: 6px 12px !important;
          border-radius: 20px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          white-space: nowrap !important;
          max-width: 140px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          box-shadow: 0 4px 20px ${shadowColor}40, 0 2px 8px ${shadowColor}20 !important;
          margin-bottom: 8px !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          pointer-events: auto !important;
          border: 2px solid rgba(255,255,255,0.3) !important;
          backdrop-filter: blur(10px) !important;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
          letter-spacing: 0.5px !important;
        }
        
        .${uniqueClass} .marker-icon {
          width: ${MARKER_SIZE}px !important;
          height: ${MARKER_SIZE}px !important;
          background: linear-gradient(135deg, ${lighterColor} 0%, ${color} 50%, ${darkerColor} 100%) !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: ${EMOJI_SIZE}px !important;
          box-shadow: 
            0 8px 32px ${shadowColor}30,
            0 4px 16px ${shadowColor}20,
            inset 0 2px 4px rgba(255,255,255,0.3),
            inset 0 -2px 4px rgba(0,0,0,0.2) !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          pointer-events: auto !important;
          border: 3px solid rgba(255,255,255,0.4) !important;
          position: relative !important;
        }
        
        .${uniqueClass} .marker-icon::before {
          content: '' !important;
          position: absolute !important;
          top: -3px !important;
          left: -3px !important;
          right: -3px !important;
          bottom: -3px !important;
          background: linear-gradient(45deg, ${color}60, transparent, ${lighterColor}60) !important;
          border-radius: 50% !important;
          z-index: -1 !important;
        }

        .${uniqueClass} .marker-trail {
          position: absolute !important;
          top: 60px !important;
          left: 50% !important;
          transform: translateX(-50%) rotate(45deg) !important;
          width: 24px !important;
          height: 24px !important;
          background: rgba(255,255,255,0.5) !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          z-index: -1;
          pointer-events: auto !important;
        }

        /* Individual Element Hover Effects */
        /* When hovering over text - bring entire marker to top and scale container */
        .${uniqueClass} .marker-text:hover {
          box-shadow: 0 6px 30px ${shadowColor}60, 0 3px 12px ${shadowColor}30 !important;
          transform: translateY(-2px) !important;
        }

        .${uniqueClass} .marker-text:hover ~ .marker-icon {
          box-shadow: 
            0 12px 40px ${shadowColor}40,
            0 6px 20px ${shadowColor}30,
            inset 0 2px 4px rgba(255,255,255,0.4),
            inset 0 -2px 4px rgba(0,0,0,0.3) !important;
        }

        /* When hovering over icon - bring entire marker to top and scale container */
        .${uniqueClass} .marker-icon:hover {
          box-shadow: 
            0 12px 40px ${shadowColor}40,
            0 6px 20px ${shadowColor}30,
            inset 0 2px 4px rgba(255,255,255,0.4),
            inset 0 -2px 4px rgba(0,0,0,0.3) !important;
        }

        .${uniqueClass} .marker-icon:hover ~ .marker-text {
          box-shadow: 0 6px 30px ${shadowColor}60, 0 3px 12px ${shadowColor}30 !important;
          transform: translateY(-2px) !important;
        }

        /* When hovering over trail - bring entire marker to top and scale container */
        .${uniqueClass} .marker-trail:hover {
          transform: translateX(-50%) rotate(45deg) !important;
        }

        /* Bring entire marker to top when hovering any element */
        .${uniqueClass} .marker-text:hover,
        .${uniqueClass} .marker-icon:hover {
          z-index: 9999 !important;
        }

        /* Scale entire container when hovering any element */
        .${uniqueClass}:has(.marker-text:hover) .marker-container,
        .${uniqueClass}:has(.marker-icon:hover) .marker-container,
        .${uniqueClass}:has(.marker-trail:hover) .marker-container {
          transform: scale(1.15) !important;
          z-index: 9999 !important;
        }

        /* Bring the root marker element to top when any child is hovered */
        .${uniqueClass}:has(.marker-text:hover),
        .${uniqueClass}:has(.marker-icon:hover),
        .${uniqueClass}:has(.marker-trail:hover) {
          z-index: 9999 !important;
        }

        /* Fallback for browsers that don't support :has() selector */
        /* Use JavaScript hover events as backup */
        .${uniqueClass}.marker-hovered {
          z-index: 9999 !important;
        }

        .${uniqueClass}.marker-hovered .marker-container {
          transform: scale(1.15) !important;
          z-index: 9999 !important;
        }

        .${uniqueClass}.marker-hovered .marker-text {
          box-shadow: 0 6px 30px ${shadowColor}60, 0 3px 12px ${shadowColor}30 !important;
          transform: translateY(-2px) !important;
        }

        .${uniqueClass}.marker-hovered .marker-icon {
          box-shadow: 
            0 12px 40px ${shadowColor}40,
            0 6px 20px ${shadowColor}30,
            inset 0 2px 4px rgba(255,255,255,0.4),
            inset 0 -2px 4px rgba(0,0,0,0.3) !important;
        }
        
      </style>
      <div class="marker-container">
        <div class="marker-text">${text}</div>
        <div class="marker-icon">${emoji}</div>
        <div class="marker-trail"></div>
      </div>

      <script>
        // Fallback JavaScript for browsers without :has() support
        (function() {
          const markerElements = document.querySelectorAll('.${uniqueClass} .marker-text, .${uniqueClass} .marker-icon, .${uniqueClass} .marker-trail');
          const markerRoot = document.querySelector('.${uniqueClass}');
          
          markerElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
              markerRoot.classList.add('marker-hovered');
            });
            
            element.addEventListener('mouseleave', () => {
              markerRoot.classList.remove('marker-hovered');
            });
          });
        })();
      </script>
    `,
    iconSize: [160, 80],
    iconAnchor: [80, 80],
    popupAnchor: [0, -80],
  });
};

const PopupContent = memo<{ color: string; emoji: string; news: NewsType }>(
  ({ color, emoji, news }) => {
    const router = useRouter();

    const address = [news.location, news.city, news.countryCode]
      .filter(Boolean)
      .join(", ");

    const handleRead = () => {
      const slug = news.slug?.startsWith("/") ? news.slug : `/${news.slug}`;
      router.push(slug);
    };

    return (
      <div className="py-4 text-sm min-w-[280px] max-w-[320px]">
        <div className="relative">
          <Badge
            style={{
              background: `linear-gradient(135deg, ${adjustColor(
                color,
                20
              )} 0%, ${color} 100%)`,
              boxShadow: `0 4px 12px ${color}30`,
            }}
            className="mb-4 text-white border-0 px-3 py-1.5 font-semibold"
          >
            <span className="mr-1.5 text-base">{emoji}</span>
            {news.topic || "News"}
          </Badge>
        </div>

        <h3 className="font-bold mb-3 line-clamp-2 text-base leading-tight text-gray-900 dark:text-gray-100">
          {news.title}
        </h3>

        <div
          className="text-sm text-gray-700 dark:text-gray-300 mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border-l-4 shadow-sm"
          style={{ borderColor: color }}
        >
          {truncateText(news.summary, 120)}
        </div>

        <div className="space-y-2.5 text-sm mb-4">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <span className="text-base">📅</span>
            <span className="font-medium">{formatDate(news.publishedAt)}</span>
          </div>

          <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
            <span className="text-base mt-0.5">📍</span>
            <span className="break-words leading-relaxed">{address}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <span className="text-base">📰</span>
            <Link
              href={news.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate transition-colors duration-200 underline-offset-2 hover:underline"
            >
              {truncateText(news.originalUrl.replace(/^https?:\/\//, ""), 35)}
            </Link>
          </div>
        </div>

        <Button
          onClick={handleRead}
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(
              color,
              -15
            )} 100%)`,
            boxShadow: `0 4px 16px ${color}30`,
          }}
          className="w-full text-white border-0 font-semibold py-2.5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          size="sm"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Read Full Story
        </Button>
      </div>
    );
  }
);

export const EnhancedNewsMarker = memo<{ news: NewsType }>(({ news }) => {
  const topicConfig = newsTopicDropdown.find(
    (t) => t.topic.toLowerCase() === news.topic?.toLowerCase()
  );

  const mColor = topicConfig?.color || "#6b7280";
  const mEmoji = topicConfig?.emoji || "📍";

  const icon = useMemo(() => {
    return createIcon(mColor, mEmoji, truncateText(news.title, 45));
  }, [mColor, mEmoji, news.title]);

  const position = useMemo(() => {
    return getPositon(news.latitude, news.longitude);
  }, [news.latitude, news.longitude]);

  if (!position) return null;

  return (
    <Marker position={position as LatLngExpression} icon={icon}>
      <Popup className="enhanced-popup">
        <PopupContent news={news} color={mColor} emoji={mEmoji} />
      </Popup>
    </Marker>
  );
});

export const EnhancedNewsMarkers = memo(() => {
  const { mapList: news } = useMapContext();
  return news.map((item) => <EnhancedNewsMarker key={item.slug} news={item} />);
});

export const NewsMarker = EnhancedNewsMarker;
export const NewsMarkers = EnhancedNewsMarkers;
