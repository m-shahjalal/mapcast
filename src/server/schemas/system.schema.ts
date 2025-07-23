import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, primaryColumn, updatedAt } from "../utils/database";

export const systemSchema = pgTable("systems", {
  id: primaryColumn("id"),

  lastCrawledAt: updatedAt("last_crawled_at").defaultNow(),
  nextCrawledAt: updatedAt("next_crawled_at").notNull(),
});
