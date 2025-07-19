import {
  pgTable,
  serial,
  varchar,
  json,
  timestamp,
  numeric,
  char,
  index,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { foreignId, primaryColumn, timestamps } from "../utils/database";

// Regions table
export const regions = pgTable(
  "regions",
  {
    id: primaryColumn("id"),
    name: varchar("name", { length: 255 }).notNull(),
    translations: json("translations"),
    wikiDataId: varchar("wikiDataId", { length: 255 }),
    ...timestamps,
  },
  (table) => ({
    nameIdx: uniqueIndex("regions_name_unique").on(table.name),
  })
);

// Subregions table
export const subregions = pgTable(
  "subregions",
  {
    id: primaryColumn("id"),
    name: varchar("name", { length: 255 }).notNull(),
    translations: json("translations"),
    wikiDataId: varchar("wikiDataId", { length: 255 }),
    regionId: foreignId("regionId", () => regions.id),
    ...timestamps,
  },
  (table) => ({
    nameIdx: uniqueIndex("subregions_name_unique").on(table.name),
    regionIdIdx: index("subregions_regionId_idx").on(table.regionId),
  })
);

// Countries table
export const countries = pgTable(
  "countries",
  {
    id: primaryColumn("id"),
    name: varchar("name", { length: 255 }).notNull(),
    iso3: char("iso3", { length: 3 }).notNull(),
    iso2: char("iso2", { length: 2 }).notNull(),
    numericCode: char("numericCode", { length: 3 }),
    phoneCode: varchar("phoneCode", { length: 50 }),
    capital: varchar("capital", { length: 255 }),
    currency: varchar("currency", { length: 10 }),
    currencyName: varchar("currencyName", { length: 255 }),
    currencySymbol: varchar("currencySymbol", { length: 10 }),
    tld: varchar("tld", { length: 10 }),
    native: varchar("native", { length: 255 }),
    region: varchar("region", { length: 255 }),
    subregion: varchar("subregion", { length: 255 }),
    latitude: numeric("latitude", { precision: 10, scale: 8 }),
    longitude: numeric("longitude", { precision: 11, scale: 8 }),
    emoji: varchar("emoji", { length: 10 }),
    emojiU: varchar("emojiU", { length: 50 }),
    timezones: json("timezones"),
    translations: json("translations"),
    wikiDataId: varchar("wikiDataId", { length: 255 }),

    regionId: foreignId("regionId", () => regions.id),
    subregionId: foreignId("subregionId", () => subregions.id),

    ...timestamps,
  },
  (table) => ({
    iso3Idx: uniqueIndex("countries_iso3_unique").on(table.iso3),
    iso2Idx: uniqueIndex("countries_iso2_unique").on(table.iso2),
    regionIdIdx: index("countries_regionId_idx").on(table.regionId),
    subregionIdIdx: index("countries_subregionId_idx").on(table.subregionId),
  })
);

// States table
export const states = pgTable(
  "states",
  {
    id: primaryColumn("id"),
    name: varchar("name", { length: 255 }).notNull(),
    countryCode: char("countryCode", { length: 2 }).notNull(),
    fipsCode: varchar("fipsCode", { length: 10 }),
    iso2: varchar("iso2", { length: 10 }),
    type: varchar("type", { length: 100 }),
    latitude: numeric("latitude", { precision: 10, scale: 8 }),
    longitude: numeric("longitude", { precision: 11, scale: 8 }),
    wikiDataId: varchar("wikiDataId", { length: 255 }),

    countryId: foreignId("countryId", () => countries.id),

    ...timestamps,
  },
  (table) => ({
    countryIdIdx: index("states_countryId_idx").on(table.countryId),
  })
);

// Cities table
export const cities = pgTable(
  "cities",
  {
    id: primaryColumn("id"),
    name: varchar("name", { length: 255 }).notNull(),
    stateCode: varchar("stateCode", { length: 10 }).notNull(),
    countryCode: char("countryCode", { length: 2 }).notNull(),
    latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
    longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
    wikiDataId: varchar("wikiDataId", { length: 255 }),

    stateId: foreignId("stateId", () => states.id),
    countryId: foreignId("countryId", () => countries.id),

    ...timestamps,
  },
  (table) => ({
    stateIdIdx: index("cities_stateId_idx").on(table.stateId),
    countryIdIdx: index("cities_countryId_idx").on(table.countryId),
  })
);

// Relations
export const regionsRelations = relations(regions, ({ many }) => ({
  countries: many(countries),
  subregions: many(subregions),
}));

export const subregionsRelations = relations(subregions, ({ one, many }) => ({
  region: one(regions, {
    fields: [subregions.regionId],
    references: [regions.id],
  }),
  countries: many(countries),
}));

export const countriesRelations = relations(countries, ({ one, many }) => ({
  regionRelation: one(regions, {
    fields: [countries.regionId],
    references: [regions.id],
  }),
  subregionRelation: one(subregions, {
    fields: [countries.subregionId],
    references: [subregions.id],
  }),
  states: many(states),
  cities: many(cities),
}));

export const statesRelations = relations(states, ({ one, many }) => ({
  country: one(countries, {
    fields: [states.countryId],
    references: [countries.id],
  }),
  cities: many(cities),
}));

export const citiesRelations = relations(cities, ({ one }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id],
  }),
  country: one(countries, {
    fields: [cities.countryId],
    references: [countries.id],
  }),
}));

export const newCountrySchema = createInsertSchema(countries).omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});

export const newStateSchema = createInsertSchema(states).omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});

export const newCitySchema = createInsertSchema(cities).omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});

// Type exports for TypeScript
export type Region = typeof regions.$inferSelect;
export type NewRegion = typeof regions.$inferInsert;

export type Subregion = typeof subregions.$inferSelect;
export type NewSubregion = typeof subregions.$inferInsert;

export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;

export type State = typeof states.$inferSelect;
export type NewState = typeof states.$inferInsert;

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
