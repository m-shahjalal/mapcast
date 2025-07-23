import { memo } from "react";
import { NewsSelect } from "@/server/schemas";
import { NewsMarker } from "./components/marker";
import { newsTopicDropdown } from "@/shared/enum-list";

interface NewsMarkersProps {
  news: NewsSelect[];
}

const filterValidNews = (news: NewsSelect[]): NewsSelect[] => {
  return news.filter(
    (item) =>
      item.latitude &&
      item.longitude &&
      !isNaN(parseFloat(item.latitude)) &&
      !isNaN(parseFloat(item.longitude))
  );
};

export const NewsMarkers = memo<NewsMarkersProps>(({ news }) => {
  const validNews = filterValidNews(news);

  return (
    <>
      {validNews.map((newsItem) => {
        const topicConfig = newsTopicDropdown.find(
          (i) => i.topic === newsItem.topic
        )!;

        const location = {
          lat: parseFloat(newsItem.latitude!),
          lng: parseFloat(newsItem.longitude!),
          name: newsItem.title,
          title: newsItem.title,
          summary: newsItem.summary,
          source: newsItem.sourceId,
          date: newsItem.createdAt,
          newsUrl: newsItem.newsUrl,
          slug: newsItem.slug,
          topic: newsItem.topic,
          address: [
            newsItem.locationName,
            newsItem.locationCity,
            newsItem.locationState,
            newsItem.locationCountry,
          ]
            .filter(Boolean)
            .join(", "),
        };

        return (
          <NewsMarker
            key={newsItem.id}
            location={{
              ...location,
              source: location.source ?? undefined,
            }}
            color={topicConfig.color}
            emoji={topicConfig.emoji}
            size="medium"
          />
        );
      })}
    </>
  );
});
