import { primaryColumn, timestamps } from "@/utils/database";
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
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { news } from "./news.schema";
import { newsTopicList } from "@/shared/enum-list";
import { newsTopicEnum } from "./enums.schema";

export const rssSource = pgTable(
  "rss_source",
  {
    id: primaryColumn(),

    name: varchar("name", { length: 255 }).notNull(),
    domain: varchar("base_url", { length: 500 }).notNull(),  
    rssUrl: varchar("rss_url", { length: 500 }).notNull().unique(),
    logoUrl: varchar("logo_url", { length: 500 }),

    country: varchar("country_name", { length: 100 }),
    language: varchar("language", { length: 10 }).default("en"),
    timezone: varchar("timezone", { length: 50 }), 
    topic: newsTopicEnum("topic").notNull(),

    description: text("description"), 
    keywords: text("keywords"), 

    apiKey: varchar("api_key", { length: 255 }),
    userAgent: varchar("user_agent", { length: 500 }), 
    requestHeaders: jsonb("request_headers"), 

    isActive: boolean("is_active").default(true),
    isPremium: boolean("is_premium").default(false),

    lastFetch: timestamp("last_fetched"),
    lastSuccessfulFetch: timestamp("last_successful_fetch"),
    totalFetches: integer("total_fetches").default(0),
    successRate: decimal("success_rate", { precision: 5, scale: 2 }), 
    avgResponseTime: integer("avg_response_time"), 

    avgReadTime: integer("avg_read_time"),  
    avgWordCount: integer("avg_word_count"), // Average article word count
    contentQualityScore: decimal("content_quality_score", {
      precision: 3,
      scale: 2,
    }),

    lastError: text("last_error"),
    errorCount: integer("error_count").default(0),
    consecutiveErrors: integer("consecutive_errors").default(0),

    ...timestamps,
  },
  ({ domain, topic, country, isActive, language }) => ({
    domainIdx: index("rss_source_domain_idx").on(domain),
    categoryIdx: index("rss_source_category_idx").on(topic),
    countryIdx: index("rss_source_country_idx").on(country),
    activeIdx: index("rss_source_active_idx").on(isActive),
    languageIdx: index("rss_source_language_idx").on(language),
    categoryCountryIdx: index("rss_source_category_country_idx").on(
      topic,
      country
    ),
  })
);

export const rssSourceRelations = relations(rssSource, ({ many }) => ({
  articles: many(news),
}));

export const createRssSourceSchema = z.object({
  name: z
    .string()
    .min(1, "Source name cannot be empty")
    .max(255, "Source name must be under 255 characters"),
  domain: z
    .url()
    .min(1, "Domain cannot be empty")
    .max(500, "Domain must be under 500 characters"),
  rssUrl: z
    .string()
    .url("Invalid RSS URL format")
    .max(500, "RSS URL must be under 500 characters"),
  logoUrl: z
    .string()
    .url("Invalid logo URL format")
    .max(500, "Logo URL must be under 500 characters")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(100, "Country name must be under 100 characters")
    .optional(),
  language: z
    .string()
    .max(10, "Language code must be under 10 characters")
    .default("en"),
  timezone: z
    .string()
    .max(50, "Timezone must be under 50 characters")
    .optional(),
  topic: z.enum(newsTopicList).default("other"),
  description: z
    .string()
    .max(1000, "Description must be under 1000 characters")
    .optional(),
  keywords: z
    .string()
    .max(500, "Keywords must be under 500 characters")
    .optional(),
  isActive: z.boolean().default(true),
});
export const updateRssSourceSchema = createInsertSchema(rssSource).partial();

// Type exports
export type RssSourceType = typeof rssSource.$inferSelect;
export type NewRssSourceType = z.infer<typeof createRssSourceSchema>;
export type UpdateRssSourceType = z.infer<typeof updateRssSourceSchema>;
