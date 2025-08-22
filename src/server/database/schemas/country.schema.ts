import { primaryColumn, timestamps } from "@/utils/database";
import { decimal, index, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

export const country = pgTable(
  "country",
  {
    id: primaryColumn("id"),
    boundingbox: jsonb("boundingbox"),
    lat: decimal("lat", { precision: 10, scale: 7 }),
    lon: decimal("lon", { precision: 10, scale: 7 }),
    name: varchar("name", { length: 255 }).notNull().unique(),
    importance: decimal("importance", { precision: 5, scale: 4 }),
    geojson: jsonb("geojson").$type<any>(),
    flag: varchar("flag", { length: 10 }).unique(),
    code: varchar("code", { length: 10 }).unique().notNull(),

    ...timestamps,
  },
  (table) => {
    return {
      nameIdx: index("name_idx").on(table.name),
      codeIdx: index("code_idx").on(table.code),
      coordinatesIdx: index("coordinates_idx").on(table.lat, table.lon),
    };
  }
);

export type Country = typeof country.$inferSelect;
export type NewCountry = typeof country.$inferInsert;
