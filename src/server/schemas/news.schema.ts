import { index, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { foreignId, primaryColumn, timestamps } from "../utils/database";
import { newsSource } from "./news-source.schema";
import {
  newsLocation,
  newsNewsLocationSchema,
  updateNewsLocationSchema,
} from "./news-location.schema";
import { relations } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod"; // Add this import

export const news = pgTable(
  "news",
  {
    id: primaryColumn("id"),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull(),
    summary: text("summary").notNull(),
    sourceId: foreignId("source_id", () => newsSource.id),
    locationId: foreignId("location_id", () => newsLocation.id),
    ...timestamps,
  },
  ({ slug }) => ({
    slugIdx: index("news_slug_idx").on(slug),
  })
);

export const newsRelations = relations(news, ({ one }) => ({
  source: one(newsSource, {
    fields: [news.sourceId],
    references: [newsSource.id],
  }),
  location: one(newsLocation, {
    fields: [news.locationId],
    references: [newsLocation.id],
  }),
}));

export const createNewNewsSchema = createInsertSchema(news)
  .pick({
    title: true,
    summary: true,
    sourceId: true,
  })
  .extend({ location: newsNewsLocationSchema });

export const updateNewsSchema = createUpdateSchema(news).extend({
  location: updateNewsLocationSchema,
});

export type NewNews = z.infer<typeof createNewNewsSchema>;
export type UpdateNews = z.infer<typeof updateNewsSchema>;
