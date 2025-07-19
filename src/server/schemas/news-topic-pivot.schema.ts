import { decimal, index, pgTable, unique } from "drizzle-orm/pg-core";
import { createdAt, foreignId, primaryColumn } from "../utils/database";
import { newsDetails } from "./new-details.schema";
import { newsTopics } from "./news-topic.schema";

export const newsTopicsPivot = pgTable(
  "news_topics_pivot",
  {
    id: primaryColumn(),
    newsId: foreignId("news_id", () => newsDetails.id),
    topicId: foreignId("topic_id", () => newsTopics.id),
    relevanceScore: decimal("relevance_score", {
      precision: 3,
      scale: 2,
    }).default("1.00"),
    createdAt: createdAt(),
  },
  (table) => ({
    newsTopicIdx: unique("news_topic_unique").on(table.newsId, table.topicId),
    newsIdx: index("news_topics_news_idx").on(table.newsId),
    topicIdx: index("news_topics_topic_idx").on(table.topicId),
  })
);
