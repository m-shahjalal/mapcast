import {
  boolean,
  decimal,
  integer,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { primaryColumn, timestamps, updatedAt } from "@/utils/database";
import { newsTopicEnum } from "./enum.schema";
export const newsSource = pgTable("news_source", {
  id: primaryColumn(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  country: varchar("country", { length: 100 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  rssUrl: varchar("rss_url", { length: 500 }).notNull().unique(),
  rssTopic: newsTopicEnum("rss_topic").notNull(),
  apiKey: varchar("api_key", { length: 255 }),
  isActive: boolean("is_active").default(true),
  lastFetch: updatedAt("last_fetched"),
  articlesCount: integer("article_count"),
  successRate: integer("success_rate"),
  ...timestamps,
});
export const newsSourceSchema = createInsertSchema(newsSource, {
  name: z
    .string({ error: "Name is required" })
    .min(1, { error: "Name is required" }),
  domain: z
    .string({ error: "Domain is required" })
    .min(1, { error: "Domain is required" }),
  rssUrl: z
    .string({ error: "RSS URL is required" })
    .min(1, { error: "RSS URL is required" }),
}).omit({
  id: true,
  lastFetch: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type NewsSourceSchemaType = z.infer<typeof newsSourceSchema>;
export type NewNewsSourceType = typeof newsSource.$inferInsert;
export type NewsSourceType = typeof newsSource.$inferSelect;
