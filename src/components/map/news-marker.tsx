import { memo } from "react";
import { NewsMarker } from "./components/marker";
import { newsTopicDropdown } from "@/shared/enum-list";
import { LocationData } from "@/config/map-context";

interface NewsMarkersProps {
  news: LocationData[];
}

export const NewsMarkers = memo<NewsMarkersProps>(({ news }) => {
  return (
    <>
      {news.map((newsItem) => {
        const topicConfig = newsTopicDropdown.find(
          (i) => i.topic === newsItem.topic
        )!;

        return (
          <NewsMarker
            key={newsItem.lat + newsItem.lng}
            location={newsItem}
            color={topicConfig.color}
            emoji={topicConfig.emoji}
            size="medium"
          />
        );
      })}
    </>
  );
});
