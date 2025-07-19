import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, unique } from "drizzle-orm/pg-core";
import { foreignId, primaryColumn, timestamps } from "../utils/database";
import { deliveryMethodEnum, themeEnum } from "./enum.schema";
import { users } from "./user.schema";

export const userSettings = pgTable(
  "user_settings",
  {
    id: primaryColumn(),
    userId: foreignId("user_id", () => users.id),
    deliveryMethod: deliveryMethodEnum("delivery_method").default("push"),

    theme: themeEnum("theme").default("light"),
    preferredLocations: jsonb("preferred_locations"),
    preferredTopics: jsonb("preferred_topics"),
    favoriteNews: jsonb("favorite_news"),
    notes: text("notes"),

    ...timestamps,
  },
  (table) => ({
    userIdx: unique("user_settings_user_idx").on(table.userId),
  })
);

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));
