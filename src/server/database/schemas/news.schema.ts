import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { foreignId, primaryColumn, timestamps } from "@/utils/database";
import { newsTopicEnum } from "./enums.schema";
import { country } from "./country.schema";
import { rssSource } from "./rss.schema";

export const news = pgTable(
  "news",
  {
    id: primaryColumn(),

    title: varchar("title", { length: 500 }).notNull(),
    metaTitle: varchar("meta_title", { length: 500 }),
    metaDescription: varchar("meta_description", { length: 500 }),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    imageUrl: varchar("img_url", { length: 1000 }),

    slug: varchar("slug", { length: 500 }).notNull().unique(),
    originalUrl: varchar("original_url", { length: 1000 }).notNull().unique(),
    sourceDomain: varchar("source_domain", { length: 500 }).notNull(),

    topic: newsTopicEnum("topic").notNull(),
    tags: jsonb("tags").$type<string[]>(),
    keywords: jsonb("keywords").$type<string[]>(),

    language: varchar("language", { length: 20 }).default("en"),
    location: varchar("location_name", { length: 500 }),
    city: varchar("location_city", { length: 200 }),
    state: varchar("location_state", { length: 200 }),
    country: varchar("country", { length: 200 }),
    countryCode: foreignId("country_code", () => country.code),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    timezone: varchar("timezone", { length: 100 }),

    publishedAt: timestamp("published_at").notNull(),
    crawledAt: timestamp("crawled_at").notNull(),
    readTime: integer("read_time"),

    viewsCount: integer("views_count").default(0),
    sharesCount: integer("shares_count").default(0),
    likesCount: integer("likes_count").default(0),

    status: varchar("status", { length: 50 }).default("published"),
    isFeatured: boolean("is_featured").default(false),
    isBreaking: boolean("is_breaking").default(false),
    isPinned: boolean("is_pinned").default(false),

    ...timestamps,
  },
  ({
    slug,
    topic,
    publishedAt,
    language,
    status,
    viewsCount,
    countryCode,
  }) => ({
    slugIdx: index("news_slug_idx").on(slug),
    topicIdx: index("news_topic_idx").on(topic),
    publishedIdx: index("news_published_at_idx").on(publishedAt),
    countryIdx: index("news_country_code_idx").on(countryCode),
    languageIdx: index("news_language_idx").on(language),
    statusIdx: index("news_status_idx").on(status),

    viewsIdx: index("news_views_count_idx").on(viewsCount),

    topicCountryIdx: index("news_topic_country_idx").on(topic, countryCode),
    publishedTopicIdx: index("news_published_topic_idx").on(publishedAt, topic),
    statusPublishedIdx: index("news_status_published_idx").on(
      status,
      publishedAt
    ),
    languageTopicIdx: index("news_language_topic_idx").on(language, topic),

    uniqueSlug: unique("news_unique_slug").on(slug),
  })
);

export const newsRelations = relations(news, ({ one }) => ({
  source: one(rssSource, {
    fields: [news.sourceDomain],
    references: [rssSource.baseUrl],
    relationName: "news_source",
  }),
}));

export const createNewsSchema = createInsertSchema(news);

export const updateNewsSchema = createInsertSchema(news).partial().omit({
  id: true,
  createdAt: true,
  originalUrl: true,
});

export type NewsType = typeof news.$inferSelect & { geojson: any };
export type NewsSelect = typeof news.$inferSelect;
export type NewNewsType = z.infer<typeof createNewsSchema>;
export type UpdateNewsType = z.infer<typeof updateNewsSchema>;
