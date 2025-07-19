import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createdAt,
  foreignId,
  primaryColumn,
  timestamps,
} from "../utils/database";
import { newsLocation } from "./news-location.schema";
import { newsSource } from "./news-source.schema";
import { newsTopics } from "./news-topic.schema";
import { relations } from "drizzle-orm";

export const newsDetails = pgTable(
  "news_details",
  {
    id: primaryColumn(),
    content: text("content").notNull(),
    originalUrl: varchar("original_url", { length: 1000 }).notNull(),
    imageUrl: varchar("image_url", { length: 500 }),
    imageAlt: varchar("image_alt", { length: 255 }),
    authorName: varchar("author_name", { length: 255 }),
    sourceId: foreignId("source_id", () => newsSource.id),
    topicId: foreignId("topic_id", () => newsTopics.id),
    locationId: foreignId("location_id", () => newsLocation.id),

    viewCount: integer("view_count").default(0),
    shareCount: integer("share_count").default(0),
    likeCount: integer("like_count").default(0),

    // Content flags
    isSponsored: boolean("is_sponsored").default(false),
    isFeatured: boolean("is_featured").default(false),
    isBreaking: boolean("is_breaking").default(false),
    isVerified: boolean("is_verified").default(false),

    // Timestamps
    publishedAt: createdAt("published_at"),
    scrapedAt: createdAt("scraped_at"),
    ...timestamps,
  },
  (table) => ({
    publishedIdx: index("news_published_idx").on(table.publishedAt),
    topicIdx: index("news_category_idx").on(table.topicId),
    sourceIdx: index("news_source_idx").on(table.sourceId),
  })
);

export const newsDetailsRelations = relations(newsDetails, ({ one }) => ({
  source: one(newsSource, {
    fields: [newsDetails.sourceId],
    references: [newsSource.id],
  }),
  topic: one(newsTopics, {
    fields: [newsDetails.topicId],
    references: [newsTopics.id],
  }),
  location: one(newsLocation, {
    fields: [newsDetails.locationId],
    references: [newsLocation.id],
  }),
}));
