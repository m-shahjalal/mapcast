import { relations } from "drizzle-orm";
import { decimal, index, pgTable, varchar } from "drizzle-orm/pg-core";
import { foreignId, primaryColumn } from "../utils/database";
import {
  cities,
  countries,
  newCitySchema,
  newStateSchema,
  regions,
  states,
} from "./location.schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

export const newsLocation = pgTable(
  "news_location",
  {
    id: primaryColumn("id"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),

    cityId: foreignId("city_id", () => cities.id),
    stateId: foreignId("region_id", () => regions.id),
    countryId: foreignId("country_id", () => countries.id),

    name: varchar("name", { length: 255 }),
    description: varchar("description", { length: 255 }),
  },
  (table) => ({
    locationIdx: index("news_location_idx").on(table.latitude, table.longitude),
  })
);

export const newsLocationRelations = relations(newsLocation, ({ one }) => ({
  city: one(cities, {
    fields: [newsLocation.cityId],
    references: [cities.id],
  }),
  state: one(states, {
    fields: [newsLocation.stateId],
    references: [states.id],
  }),
  country: one(countries, {
    fields: [newsLocation.countryId],
    references: [countries.id],
  }),
}));

export const newsNewsLocationSchema = createInsertSchema(newsLocation)
  .pick({
    description: true,
    name: true,
    latitude: true,
    longitude: true,
  })
  .extend({
    city: newCitySchema,
    state: newStateSchema,
    country: newCitySchema,
  });

export const updateNewsLocationSchema = createUpdateSchema(newsLocation);
