import { newsTopicList } from "@/shared/enum-list";
import { primaryColumn, timestamps } from "@/utils/database";
import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { newsTopicEnum } from "./enums.schema";

export const news = pgTable(
  "news",
  {
    id: primaryColumn(),

    title: varchar("title", { length: 200 }).notNull(),
    metaTitle: varchar("meta_title", { length: 60 }),
    metaDescription: varchar("meta_description", { length: 160 }),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    excerpt: varchar("excerpt", { length: 300 }), // For previews and rich snippets

    // URL and routing optimization
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    originalUrl: varchar("original_url", { length: 500 }).notNull().unique(), // Source article URL
    ampUrl: varchar("amp_url", { length: 500 }), // AMP version URL
    sourceDomain: varchar("source_domain", { length: 255 }).notNull(),

    // Content categorization and SEO
    topic: newsTopicEnum("topic").notNull(),
    tags: text("tags"), // Comma-separated tags for topic relevance
    keywords: text("keywords"), // Primary SEO keywords

    // Geographic targeting for local SEO
    language: varchar("language", { length: 10 }).default("en"),
    locationName: varchar("location_name", { length: 255 }),
    locationCity: varchar("location_city", { length: 100 }),
    locationState: varchar("location_state", { length: 100 }),
    locationCountry: varchar("location_country", { length: 100 }),
    locationCountryCode: varchar("location_country_code", { length: 2 }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    timezone: varchar("timezone", { length: 50 }),

    // Time-based SEO factors
    publishedAt: timestamp("published_at").notNull(),
    crawledAt: timestamp("crawled_at").notNull(),
    readTime: integer("read_time"), // Estimated reading time in minutes

    // SEO performance and engagement metrics
    viewsCount: integer("views_count").default(0),
    sharesCount: integer("shares_count").default(0),
    likesCount: integer("likes_count").default(0),

    // Content status and workflow
    status: varchar("status", { length: 50 }).default("published"), // draft, published, archived, etc.
    isFeatured: boolean("is_featured").default(false),
    isBreaking: boolean("is_breaking").default(false),
    isPinned: boolean("is_pinned").default(false),

    ...timestamps,
  },
  ({
    slug,
    topic,
    locationCountryCode,
    publishedAt,
    language,
    status,
    viewsCount,
  }) => ({
    // Critical SEO indexes
    slugIdx: index("news_slug_idx").on(slug),
    topicIdx: index("news_topic_idx").on(topic),
    publishedIdx: index("news_published_at_idx").on(publishedAt),
    countryIdx: index("news_country_code_idx").on(locationCountryCode),
    languageIdx: index("news_language_idx").on(language),
    statusIdx: index("news_status_idx").on(status),

    viewsIdx: index("news_views_count_idx").on(viewsCount),

    topicCountryIdx: index("news_topic_country_idx").on(
      topic,
      locationCountryCode
    ),
    publishedTopicIdx: index("news_published_topic_idx").on(publishedAt, topic),
    statusPublishedIdx: index("news_status_published_idx").on(
      status,
      publishedAt
    ),
    languageTopicIdx: index("news_language_topic_idx").on(language, topic),

    uniqueSlug: unique("news_unique_slug").on(slug),
  })
);

// Relations
export const newsRelations = relations(news, ({ one, many }) => ({
  duplicates: many(news), // Articles that are duplicates of this one
}));

// Validation schemas
export const createNewsSchema = createInsertSchema(news);

export const updateNewsSchema = createInsertSchema(news).partial().omit({
  id: true,
  createdAt: true,
  originalUrl: true,
});

// Type exports
export type NewsType = typeof news.$inferSelect;
export type NewNewsType = z.infer<typeof createNewsSchema>;
export type UpdateNewsType = z.infer<typeof updateNewsSchema>;
