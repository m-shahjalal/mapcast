import { primaryColumn } from "@/utils/database";
import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const cronLogs = pgTable("cron_logs", {
  id: primaryColumn("id"),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"),
  output: text("output"),
  errorMessage: text("error_message"),
});

export type CronLog = typeof cronLogs.$inferSelect;
export type NewCronLog = typeof cronLogs.$inferInsert;
