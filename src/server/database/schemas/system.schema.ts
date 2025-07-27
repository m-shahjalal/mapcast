import { primaryColumn, updatedAt } from "@/utils/database";
import { pgTable } from "drizzle-orm/pg-core";

export const systemSchema = pgTable("systems", {
  id: primaryColumn("id"),

  lastCrawledAt: updatedAt("last_crawled_at").defaultNow(),
  nextCrawledAt: updatedAt("next_crawled_at").notNull(),
});
