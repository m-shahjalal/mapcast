import { memo } from "react";
import { NewsSelect } from "@/server/schemas";
import { FancyMarker } from "./components/marker";

interface NewsMarkersProps {
  news: NewsSelect[];
  selectedTopic?: string;
  onNewsClick?: (newsItem: NewsSelect) => void;
}

// Enhanced topic configurations with colors and emojis
const TOPIC_CONFIG = {
  Politics: { color: "#dc2626", emoji: "🏛️" },
  Sports: { color: "#16a34a", emoji: "⚽" },
  Entertainment: { color: "#9333ea", emoji: "🎭" },
  Technology: { color: "#2563eb", emoji: "💻" },
  Business: { color: "#ea580c", emoji: "💼" },
  Health: { color: "#059669", emoji: "🏥" },
  Science: { color: "#7c3aed", emoji: "🔬" },
  World: { color: "#0891b2", emoji: "🌍" },
  Breaking: { color: "#ef4444", emoji: "🚨" },
  Trending: { color: "#f59e0b", emoji: "📈" },
  Local: { color: "#84cc16", emoji: "🏘️" },
  Weather: { color: "#06b6d4", emoji: "🌤️" },
  Crime: { color: "#991b1b", emoji: "🚔" },
  Education: { color: "#7c2d12", emoji: "🎓" },
  Environment: { color: "#166534", emoji: "🌱" },
  Other: { color: "#6b7280", emoji: "📰" },
} as const;

// Get topic configuration
const getTopicConfig = (topic: string) => {
  return TOPIC_CONFIG[topic as keyof typeof TOPIC_CONFIG] || TOPIC_CONFIG.Other;
};

// Filter valid news items
const filterValidNews = (news: NewsSelect[]): NewsSelect[] => {
  return news.filter(
    (item) =>
      item.latitude &&
      item.longitude &&
      !isNaN(parseFloat(item.latitude)) &&
      !isNaN(parseFloat(item.longitude))
  );
};

// Determine news category based on content analysis
const categorizeNews = (newsItem: NewsSelect): string => {
  const title = newsItem.title.toLowerCase();
  const summary = newsItem.summary?.toLowerCase() || "";
  const content = `${title} ${summary}`;

  // Keywords for categorization
  const categoryKeywords = {
    Politics: [
      "election",
      "government",
      "president",
      "congress",
      "senate",
      "political",
      "vote",
      "campaign",
      "policy",
    ],
    Sports: [
      "game",
      "team",
      "player",
      "match",
      "championship",
      "league",
      "tournament",
      "score",
      "sports",
    ],
    Technology: [
      "tech",
      "ai",
      "software",
      "app",
      "digital",
      "computer",
      "internet",
      "startup",
      "innovation",
    ],
    Business: [
      "company",
      "market",
      "stock",
      "economy",
      "business",
      "finance",
      "investment",
      "profit",
      "trade",
    ],
    Health: [
      "health",
      "medical",
      "hospital",
      "doctor",
      "disease",
      "treatment",
      "vaccine",
      "medicine",
    ],
    Science: [
      "research",
      "study",
      "scientist",
      "discovery",
      "experiment",
      "space",
      "climate",
      "energy",
    ],
    Breaking: ["breaking", "urgent", "alert", "developing", "just in", "live"],
    Crime: [
      "police",
      "arrest",
      "crime",
      "investigation",
      "court",
      "law enforcement",
      "charges",
    ],
    Weather: [
      "weather",
      "storm",
      "rain",
      "snow",
      "temperature",
      "climate",
      "forecast",
      "hurricane",
    ],
    Environment: [
      "environment",
      "pollution",
      "green",
      "sustainable",
      "wildlife",
      "conservation",
    ],
  };

  // Check for category matches
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => content.includes(keyword))) {
      return category;
    }
  }

  return "Other";
};

export const NewsMarkers = memo<NewsMarkersProps>(
  ({ news, selectedTopic, onNewsClick }) => {
    const validNews = filterValidNews(news);

    const handleLinkClick = (url: string, newsItem?: NewsSelect) => {
      if (newsItem && onNewsClick) {
        onNewsClick(newsItem);
      } else {
        if (url.startsWith("/")) {
          window.location.href = url;
        } else {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }
    };

    return (
      <>
        {validNews.map((newsItem) => {
          // Determine category if not provided
          const category = selectedTopic || categorizeNews(newsItem);
          const topicConfig = getTopicConfig(category);

          // Create location data
          const location = {
            lat: parseFloat(newsItem.latitude!),
            lng: parseFloat(newsItem.longitude!),
            name: newsItem.title,
            title: newsItem.title,
            summary: newsItem.summary,
            source: newsItem.sourceId, // You might want to resolve this to actual source name
            date: newsItem.createdAt,
            newsUrl: newsItem.newsUrl,
            slug: newsItem.slug,
            topic: category,
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
            <FancyMarker
              key={newsItem.id}
              location={{
                ...location,
                source: location.source ?? undefined,
              }}
              color={topicConfig.color}
              emoji={topicConfig.emoji}
              size="medium"
              pulseAnimation={category === "Breaking"}
              onLinkClick={(url) => handleLinkClick(url, newsItem)}
            />
          );
        })}
      </>
    );
  }
);
