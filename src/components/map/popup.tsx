import { TopicItem, useMapContext } from "@/config/map-context";
import { formatDate, truncateText } from "@/utils/cn";
import { FileSpreadsheet, Calendar, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Popup } from "react-leaflet";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { adjustColor } from "./marker";
import { NewsType } from "@/server/database/schemas";
import { IconSpinner } from "../ui/spinner";

const PopupContent = ({
  news,
  topic,
}: {
  news: NewsType;
  topic: TopicItem;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const address = [news.location, news.city, news.countryCode]
    .filter(Boolean)
    .join(", ");

  const handleRead = useCallback(() => {
    setIsLoading(true);
    router.push(news.slug?.startsWith("/") ? news.slug : `/${news.slug}`);
  }, [news.slug, router, isLoading]);

  useEffect(() => () => setIsLoading(false), []);

  return (
    <div className="relative p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-xl backdrop-blur">
      {/* Accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, transparent, ${topic.color}, transparent)`,
        }}
      />

      {/* Badge */}
      <Badge
        style={{
          background: `linear-gradient(135deg, ${topic.color}, ${adjustColor(
            topic.color,
            -20
          )})`,
        }}
        className="text-white border-0 px-2 py-1 text-xs font-semibold mb-3 rounded-lg shadow-md"
      >
        <span className="mr-1">{topic.emoji}</span>
        {news.topic || "News"}
      </Badge>

      {/* Title */}
      <h3 className="font-bold text-sm leading-tight mb-3 text-gray-900 dark:text-white">
        {news.title}
      </h3>

      {/* Summary */}
      <div
        className="text-xs text-gray-700 dark:text-gray-300 mb-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border-l-3"
        style={{ borderColor: topic.color }}
      >
        {truncateText(news.summary, 100)}
      </div>

      {/* Meta info */}
      <div className="space-y-2 text-xs mb-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="w-3 h-3" style={{ color: topic.color }} />
          {formatDate(news.publishedAt)}
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <MapPin className="w-3 h-3" style={{ color: topic.color }} />
          {address}
        </div>
        <div className="flex items-center gap-2">
          <ExternalLink className="w-3 h-3" style={{ color: topic.color }} />
          <Link
            href={news.originalUrl}
            target="_blank"
            className="text-xs hover:underline truncate"
            style={{ color: topic.color }}
          >
            {truncateText(news.originalUrl.replace(/^https?:\/\//, ""), 30)}
          </Link>
        </div>
      </div>

      <Button
        onClick={handleRead}
        style={{
          background: `linear-gradient(135deg, ${topic.color}, ${adjustColor(
            topic.color,
            -15
          )})`,
        }}
        className="w-full text-white border-0 text-xs py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
        ) : (
          <FileSpreadsheet className="w-3 h-3 mr-1" />
        )}
        Read Full Story
      </Button>
    </div>
  );
};

export const PopupNews = () => {
  const { popup } = useMapContext();
  if (!popup) return;

  const { news, topic, position } = popup;
  return (
    <Popup
      position={position}
      className="fancy-popup"
      maxWidth={300}
      minWidth={280}
    >
      <PopupContent news={news} topic={topic} />
    </Popup>
  );
};
