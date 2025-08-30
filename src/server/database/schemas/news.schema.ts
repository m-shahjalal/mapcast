import { foreignId, primaryColumn, timestamps } from "@/utils/database";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { country } from "./country.schema";
import { newsTopicEnum } from "./enums.schema";
import { rssSource } from "./rss.schema";

export const news = pgTable(
  "news",
  {
    id: primaryColumn(),
    title: varchar("title", { length: 500 }).notNull(),
    metaTitle: varchar("meta_title", { length: 60 }), // SEO optimal length
    metaDescription: varchar("meta_description", { length: 160 }), // SEO optimal length
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    imageUrl: varchar("img_url", { length: 2000 }), // URLs can be longer
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    originalUrl: varchar("original_url", { length: 2000 }).notNull().unique(),
    sourceDomain: varchar("source_domain", { length: 255 }).notNull(),

    // Content classification
    topic: newsTopicEnum("topic").notNull(),
    tags: jsonb("tags").$type<string[]>().default([]),
    keywords: jsonb("keywords").$type<string[]>().default([]),
    language: varchar("language", { length: 10 }).notNull().default("en"), // ISO 639-1 format

    // Location data - make consistent with your AI response
    location: varchar("location_name", { length: 255 }), // Specific place (village, landmark)
    city: varchar("location_city", { length: 100 }),
    state: varchar("location_state", { length: 100 }),
    country: varchar("location_country", { length: 100 }), // Renamed for clarity
    countryCode: foreignId("country_code", () => country.code),

    // Coordinates - increased precision for better accuracy
    latitude: real("latitude"), // 8 real places
    longitude: real("longitude"),
    timezone: varchar("timezone", { length: 50 }), // e.g., "America/New_York"

    // Timestamps
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    crawledAt: timestamp("crawled_at", { withTimezone: true }).notNull(),

    // Content metrics
    readTime: integer("read_time").notNull(), // Required for your AI response
    wordCount: integer("word_count"), // Useful for analytics

    // Engagement metrics
    viewsCount: integer("views_count").notNull().default(0),
    sharesCount: integer("shares_count").notNull().default(0),
    likesCount: integer("likes_count").notNull().default(0),
    commentsCount: integer("comments_count").notNull().default(0),

    // Content status
    status: varchar("status", { length: 20 }).notNull().default("published"),

    // Content flags
    isFeatured: boolean("is_featured").notNull().default(false),
    isBreaking: boolean("is_breaking").notNull().default(false),
    isPinned: boolean("is_pinned").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false), // For fact-checking

    // SEO and analytics
    seoScore: integer("seo_score"), // 0-100 SEO quality score
    qualityScore: integer("quality_score"), // AI-generated content quality score

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
    location,
    city,
    country,
    originalUrl,
    isFeatured,
    isBreaking,
    crawledAt,
  }) => ({
    // Primary indexes for common queries
    slugIdx: index("news_slug_idx").on(slug),
    topicIdx: index("news_topic_idx").on(topic),
    publishedIdx: index("news_published_at_idx").on(publishedAt),
    statusIdx: index("news_status_idx").on(status),
    languageIdx: index("news_language_idx").on(language),

    // Location indexes
    countryIdx: index("news_country_code_idx").on(countryCode),
    locationIdx: index("news_location_idx").on(location),
    cityIdx: index("news_city_idx").on(city),
    countryNameIdx: index("news_country_name_idx").on(country),

    // Engagement indexes
    viewsIdx: index("news_views_count_idx").on(viewsCount),
    featuredIdx: index("news_featured_idx").on(isFeatured),
    breakingIdx: index("news_breaking_idx").on(isBreaking),

    // Composite indexes for common query patterns
    topicCountryIdx: index("news_topic_country_idx").on(topic, countryCode),
    publishedTopicIdx: index("news_published_topic_idx").on(publishedAt, topic),
    statusPublishedIdx: index("news_status_published_idx").on(
      status,
      publishedAt
    ),
    languageTopicIdx: index("news_language_topic_idx").on(language, topic),
    featuredPublishedIdx: index("news_featured_published_idx").on(
      isFeatured,
      publishedAt
    ),
    crawledStatusIdx: index("news_crawled_status_idx").on(crawledAt, status),

    // Location-based composite indexes
    countryTopicIdx: index("news_country_topic_idx").on(country, topic),
    cityTopicIdx: index("news_city_topic_idx").on(city, topic),

    // Unique constraints
    uniqueSlug: unique("news_unique_slug").on(slug),
    uniqueOriginalUrl: unique("news_unique_original_url").on(originalUrl),
  })
);

export const newsRelations = relations(news, ({ one }) => ({
  source: one(rssSource, {
    fields: [news.sourceDomain],
    references: [rssSource.baseUrl],
    relationName: "news_source",
  }),
  countryRelation: one(country, {
    fields: [news.countryCode],
    references: [country.code],
    relationName: "news_country",
  }),
}));

// Enhanced Zod schemas with proper validation
export const createNewsSchema = createInsertSchema(news, {
  title: z.string().min(1).max(500),
  summary: z.string().min(1),
  content: z.string().min(1),
  slug: z.string().min(1).max(255),
  originalUrl: z.string().url().max(2000),
  sourceDomain: z.string().min(1).max(255),
  language: z.string().length(2), // ISO 639-1
  readTime: z.number().int().positive(),
  latitude: z
    .string()
    .optional()
    .refine(
      (val) => !val || (parseFloat(val) >= -90 && parseFloat(val) <= 90),
      "Latitude must be between -90 and 90"
    ),
  longitude: z
    .string()
    .optional()
    .refine(
      (val) => !val || (parseFloat(val) >= -180 && parseFloat(val) <= 180),
      "Longitude must be between -180 and 180"
    ),
  tags: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  crawledAt: true, // This should be set by the system
});

export const updateNewsSchema = createNewsSchema.partial().omit({
  originalUrl: true, // Prevent URL changes after creation
  publishedAt: true, // Prevent timestamp manipulation
});

// Enhanced type definitions
export type NewsType = typeof news.$inferSelect
export type NewsSelect = typeof news.$inferSelect;
export type NewNewsType = typeof news.$inferInsert;
export type UpdateNewsType = z.infer<typeof updateNewsSchema>;

// Additional utility types
export type NewsWithLocation = NewsSelect & {
  hasLocation: boolean;
  coordinates?: { latitude: number; longitude: number };
};

export type NewsFilters = {
  topic?: string;
  country?: string;
  city?: string;
  language?: string;
  status?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  dateRange?: { start: Date; end: Date };
};
