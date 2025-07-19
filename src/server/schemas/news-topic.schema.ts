import { boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { foreignId, primaryColumn, timestamps } from "../utils/database";

export const newsTopics = pgTable("news_topics", {
  id: primaryColumn(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#007bff"),
  parentId: foreignId("parent_id", (): any => newsTopics.id),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  sortOrder: integer("sort_order").default(0),

  ...timestamps,
});
