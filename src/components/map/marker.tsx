import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMapContext } from "@/config/map-context";
import { formatDate, truncateText } from "@/utils/cn";
import { NewsType } from "@/server/database/schemas";
import { newsTopicDropdown } from "@/shared/enum-list";
import { getPositon } from "@/utils/urls";
import L, { LatLngExpression } from "leaflet";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useMemo } from "react";
import { Marker, Popup } from "react-leaflet";

const MARKER_SIZE = 36;
const EMOJI_SIZE = 18;

const createIcon = (color: string, emoji: string, text: string): L.DivIcon => {
  const colorHash = color.replace("#", "").replace(/[^a-zA-Z0-9]/g, "");
  const uniqueClass = `news-marker-${colorHash}`;

  return L.divIcon({
    className: `news-marker-custom ${uniqueClass}`,
    html: `
      <style>
        .${uniqueClass} .marker-container {
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          cursor: pointer !important;
          z-index: 1000 !important;
        }
        
        .${uniqueClass} .marker-text {
          background: ${color} !important;
          color: white !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          white-space: nowrap !important;
          max-width: 120px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          margin-bottom: 4px !important;
          transition: all 0.5s ease !important;
          transition-delay: 1s;
          pointer-events: auto !important;
        }
        
        .${uniqueClass} .marker-icon {
          width: ${MARKER_SIZE}px !important;
          height: ${MARKER_SIZE}px !important;
          background: ${color} !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: ${EMOJI_SIZE}px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          transition: all 0.5s ease !important;
          transition-delay: 1s;
          pointer-events: auto !important;
        }
        
        .${uniqueClass} .marker-arrow {
          width: 0 !important;
          height: 0 !important;
          border-left: 8px solid transparent !important;
          border-right: 8px solid transparent !important;
          border-top: 12px solid ${color} !important;
          margin-top: -2px !important;
          opacity: 0.9 !important;
          transition: all 0.5s ease !important;
          transition-delay: 1s;
          pointer-events: auto !important;
        }
        
        /* Container hover effect for z-index */
        .${uniqueClass} .marker-container:hover {
          z-index: 999999 !important;
        }
        
        /* Individual element hover effects */
        .${uniqueClass} .marker-text:hover,
        .${uniqueClass} .marker-text:hover ~ .marker-icon,
        .${uniqueClass} .marker-text:hover ~ .marker-arrow {
          transform: scale(1.1) !important;
          filter: drop-shadow(0 6px 16px rgba(0,0,0,0.4)) !important;
        }
        
        .${uniqueClass} .marker-icon:hover,
        .${uniqueClass} .marker-icon:hover ~ .marker-arrow,
        .${uniqueClass} .marker-text:has(~ .marker-icon:hover) {
          transform: scale(1.1) !important;
          filter: drop-shadow(0 6px 16px rgba(0,0,0,0.4)) !important;
        }
        
        .${uniqueClass} .marker-arrow:hover,
        .${uniqueClass} .marker-text:has(~ .marker-arrow:hover),
        .${uniqueClass} .marker-icon:has(~ .marker-arrow:hover) {
          transform: scale(1.1) !important;
          filter: drop-shadow(0 6px 16px rgba(0,0,0,0.4)) !important;
        }
        
        /* Ensure the entire marker comes to top when any child is hovered */
        .${uniqueClass}:has(.marker-text:hover),
        .${uniqueClass}:has(.marker-icon:hover),
        .${uniqueClass}:has(.marker-arrow:hover) {
          z-index: 999999 !important;
        }
      </style>
      <div class="marker-container">
        <div class="marker-text">${text}</div>
        <div class="marker-icon">${emoji}</div>
        <div class="marker-arrow"></div>
      </div>
    `,
    iconSize: [140, 60],
    iconAnchor: [70, 60],
    popupAnchor: [0, -60],
  });
};

const PopupContent = memo<{ color: string; emoji: string; news: NewsType }>(
  ({ color, emoji, news }) => {
    const router = useRouter();

    const address = [news.location, news.location, news.countryCode]
      .filter(Boolean)
      .join(", ");

    const handleRead = () => {
      const slug = news.slug?.startsWith("/") ? news.slug : `/${news.slug}`;
      router.push(slug);
    };

    return (
      <div className="p-2 text-sm min-w-[200px]">
        <Badge style={{ backgroundColor: color }} className="mb-3">
          {emoji} {news.topic || "News"}
        </Badge>

        <h3 className="font-bold mb-2 line-clamp-2">{news.title}</h3>

        <p
          className="text-xs text-gray-600 dark:text-gray-400 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded border-l-2"
          style={{ borderColor: color }}
        >
          {truncateText(news.summary, 100)}
        </p>

        <div className="space-y-1 text-xs mb-3">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{formatDate(news.publishedAt)}</span>
          </div>

          <div className="flex items-start gap-2">
            <span>📍</span>
            <span className="break-words">{address}</span>
          </div>

          <div className="flex items-center gap-2">
            <span>📰</span>
            <Link
              href={news.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 truncate"
            >
              {truncateText(news.originalUrl.replace(/^https?:\/\//, ""), 30)}
            </Link>
          </div>
        </div>

        <Button
          onClick={handleRead}
          style={{ backgroundColor: color }}
          className="w-full"
          size="sm"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Read Story
        </Button>
      </div>
    );
  }
);

export const NewsMarker = memo<{ news: NewsType }>(({ news }) => {
  const topicConfig = newsTopicDropdown.find(
    (t) => t.topic.toLowerCase() === news.topic?.toLowerCase()
  );

  const mColor = topicConfig?.color || "#6b7280";
  const mEmoji = topicConfig?.emoji || "📍";

  const icon = useMemo(() => {
    return createIcon(mColor, mEmoji, truncateText(news.title, 50));
  }, [mColor, mEmoji, news.title]);

  const position = useMemo(() => {
    return getPositon(news.latitude, news.longitude);
  }, [news.latitude, news.longitude]);

  if (!position) return null;

  return (
    <Marker position={position as LatLngExpression} icon={icon}>
      <Popup>
        <PopupContent news={news} color={mColor} emoji={mEmoji} />
      </Popup>
    </Marker>
  );
});

export const NewsMarkers = memo(() => {
  const { mapList: news } = useMapContext();
  return news.map((item) => <NewsMarker key={item.slug} news={item} />);
});
