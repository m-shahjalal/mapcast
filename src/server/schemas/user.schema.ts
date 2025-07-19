import { relations } from "drizzle-orm";
import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, primaryColumn, timestamps } from "../utils/database";
import { subscriptionTierEnum } from "./enum.schema";
import { userSettings } from "./user-setting.schema";

// Users table
export const users = pgTable("users", {
  id: primaryColumn(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 50 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  isPremium: boolean("is_premium").default(false),
  subscriptionTier: subscriptionTierEnum("subscription_tier").default("free"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: createdAt("last_login_at"),
  ...timestamps,
});

export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userSettings),
}));
