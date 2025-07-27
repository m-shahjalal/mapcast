// news.schema.ts
import { index, pgTable, text, varchar, decimal } from "drizzle-orm/pg-core";
import { foreignId, primaryColumn, timestamps } from "@/utils/database";
import { newsSource } from "./news-source.schema";
import { relations } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { newsTopicEnum } from "./enum.schema";

export const news = pgTable(
  "news",
  {
    id: primaryColumn("id"),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull(),
    summary: text("summary").notNull().notNull(),
    sourceId: foreignId("source_id", () => newsSource.id),
    newsUrl: varchar("news_url", { length: 500 }).notNull().unique(),

    locationName: varchar("location_name", { length: 255 }),
    locationCity: varchar("location_city", { length: 255 }),
    locationState: varchar("location_state", { length: 255 }),
    locationCountry: varchar("location_country", { length: 255 }),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),

    topic: newsTopicEnum("topic").notNull(),

    ...timestamps,
  },
  ({ slug, latitude, longitude, newsUrl }) => ({
    slugIdx: index("news_slug_idx").on(slug),
    locationIdx: index("news_location_idx").on(latitude, longitude),
    urlIdx: index("news_source_url_idx").on(newsUrl),
  })
);

export const newsRelations = relations(news, ({ one }) => ({
  source: one(newsSource, {
    fields: [news.sourceId],
    references: [newsSource.id],
  }),
}));

export const createNewNewsSchema = createInsertSchema(news).pick({
  title: true,
  summary: true,
  sourceId: true,
  locationName: true,
  locationCity: true,
  locationState: true,
  locationCountry: true,
  latitude: true,
  longitude: true,
  newsUrl: true,
  topic: true,
});

export const updateNewsSchema = createUpdateSchema(news);

export type NewsSelect = typeof news.$inferSelect;
export type NewNews = z.infer<typeof createNewNewsSchema>;
export type UpdateNews = z.infer<typeof updateNewsSchema>;
