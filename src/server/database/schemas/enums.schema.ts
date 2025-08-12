import { newsTopicList } from "@/shared/enum-list";
import { pgEnum } from "drizzle-orm/pg-core";

export const newsTopicEnum = pgEnum("news_topic", newsTopicList);
export const sourceStatusEnum = pgEnum("source_status", [
  "active",
  "inactive",
  "error",
  "maintenance",
]);
