import { boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { primaryColumn, timestamps } from "../utils/database";

export const images = pgTable("images", {
  id: primaryColumn(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  altText: varchar("alt_text", { length: 255 }),
  caption: text("caption"),
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 50 }),
  isMain: boolean("is_main").default(false),
  sortOrder: integer("sort_order").default(0),
  ...timestamps,
});
