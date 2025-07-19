import { eq, ilike, and, or } from "drizzle-orm";
import db from "../database";
import { cities, countries, regions, states, subregions } from "../schemas";
import { LocationFilters } from "@/types/query-filter";

export const LocationService = {
  getRegions: async (search?: string) => {
    const query = db.select().from(regions);

    if (search) {
      query.where(ilike(regions.name, `%${search}%`));
    }

    return query.orderBy(regions.name);
  },

  getSubregions: async (regionId: number, search?: string) => {
    const conditions = [eq(subregions.regionId, regionId)];

    if (search) {
      conditions.push(ilike(subregions.name, `%${search}%`));
    }

    return db
      .select()
      .from(subregions)
      .where(and(...conditions))
      .orderBy(subregions.name);
  },

  getCountries: async (
    filters: Pick<LocationFilters, "regionId" | "subregionId" | "search">
  ) => {
    const conditions = [];

    if (filters.regionId) {
      conditions.push(eq(countries.regionId, filters.regionId));
    }

    if (filters.subregionId) {
      conditions.push(eq(countries.subregionId, filters.subregionId));
    }

    if (filters.search) {
      conditions.push(ilike(countries.name, `%${filters.search}%`));
    }

    const query = db.select().from(countries);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    return query.orderBy(countries.name);
  },

  getStates: async (countryId: number, search?: string) => {
    const conditions = [eq(states.countryId, countryId)];

    if (search) {
      conditions.push(ilike(states.name, `%${search}%`));
    }

    return db
      .select()
      .from(states)
      .where(and(...conditions))
      .orderBy(states.name);
  },

  getCities: async (
    filters: Pick<
      LocationFilters,
      "countryId" | "stateId" | "search" | "limit" | "page"
    >
  ) => {
    const conditions = [];

    if (filters.countryId) {
      conditions.push(eq(cities.countryId, filters.countryId));
    }

    if (filters.stateId) {
      conditions.push(eq(cities.stateId, filters.stateId));
    }

    if (filters.search) {
      conditions.push(ilike(cities.name, `%${filters.search}%`));
    }

    const query = db.select().from(cities);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    query.orderBy(cities.name);

    if (filters.limit) {
      query.limit(filters.limit);
    }

    if (filters.page && filters.limit) {
      query.offset(filters.page * filters.limit);
    }

    return query;
  },

  getLocationHierarchy: async (filters: LocationFilters) => {
    const conditions = [];

    if (filters.regionId) {
      conditions.push(eq(countries.regionId, filters.regionId));
    }

    if (filters.subregionId) {
      conditions.push(eq(countries.subregionId, filters.subregionId));
    }

    if (filters.countryId) {
      conditions.push(eq(cities.countryId, filters.countryId));
    }

    if (filters.stateId) {
      conditions.push(eq(cities.stateId, filters.stateId));
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(cities.name, `%${filters.search}%`),
          ilike(states.name, `%${filters.search}%`),
          ilike(countries.name, `%${filters.search}%`)
        )
      );
    }

    const query = db
      .select({
        city: cities,
        state: states,
        country: countries,
        region: regions,
        subregion: subregions,
      })
      .from(cities)
      .leftJoin(states, eq(cities.stateId, states.id))
      .leftJoin(countries, eq(cities.countryId, countries.id))
      .leftJoin(regions, eq(countries.regionId, regions.id))
      .leftJoin(subregions, eq(countries.subregionId, subregions.id));

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    query.orderBy(cities.name);

    if (filters.limit) {
      query.limit(filters.limit);
    }

    if (filters.page && filters.limit) {
      query.offset(filters.page * filters.limit);
    }

    return query;
  },

  searchLocations: async (search: string, limit = 50) => {
    const regionResults = await db
      .select({ id: regions.id, name: regions.name })
      .from(regions)
      .where(ilike(regions.name, `%${search}%`))
      .limit(limit);

    const countryResults = await db
      .select({
        id: countries.id,
        name: countries.name,
      })
      .from(countries)
      .where(ilike(countries.name, `%${search}%`))
      .limit(limit);

    const stateResults = await db
      .select({ id: states.id, name: states.name })
      .from(states)
      .where(ilike(states.name, `%${search}%`))
      .limit(limit);

    const cityResults = await db
      .select({ id: cities.id, name: cities.name })
      .from(cities)
      .where(ilike(cities.name, `%${search}%`))
      .limit(limit);

    return {
      regions: regionResults,
      countries: countryResults,
      states: stateResults,
      cities: cityResults,
    };
  },

  getLocationById: async (
    type: "region" | "country" | "state" | "city",
    id: number
  ) => {
    switch (type) {
      case "region":
        return db.select().from(regions).where(eq(regions.id, id));

      case "country":
        return db
          .select({
            country: countries,
            region: regions,
            subregion: subregions,
          })
          .from(countries)
          .leftJoin(regions, eq(countries.regionId, regions.id))
          .leftJoin(subregions, eq(countries.subregionId, subregions.id))
          .where(eq(countries.id, id));

      case "state":
        return db
          .select({
            state: states,
            country: countries,
            region: regions,
            subregion: subregions,
          })
          .from(states)
          .leftJoin(countries, eq(states.countryId, countries.id))
          .leftJoin(regions, eq(countries.regionId, regions.id))
          .leftJoin(subregions, eq(countries.subregionId, subregions.id))
          .where(eq(states.id, id));

      case "city":
        return db
          .select({
            city: cities,
            state: states,
            country: countries,
            region: regions,
            subregion: subregions,
          })
          .from(cities)
          .leftJoin(states, eq(cities.stateId, states.id))
          .leftJoin(countries, eq(cities.countryId, countries.id))
          .leftJoin(regions, eq(countries.regionId, regions.id))
          .leftJoin(subregions, eq(countries.subregionId, subregions.id))
          .where(eq(cities.id, id));
    }
  },

  getLocationCounts: async (filters: LocationFilters) => {
    const conditions = [];

    if (filters.regionId) {
      conditions.push(eq(countries.regionId, filters.regionId));
    }

    if (filters.subregionId) {
      conditions.push(eq(countries.subregionId, filters.subregionId));
    }

    if (filters.countryId) {
      conditions.push(eq(cities.countryId, filters.countryId));
    }

    if (filters.stateId) {
      conditions.push(eq(cities.stateId, filters.stateId));
    }

    const baseQuery = db
      .select()
      .from(cities)
      .leftJoin(states, eq(cities.stateId, states.id))
      .leftJoin(countries, eq(cities.countryId, countries.id))
      .leftJoin(regions, eq(countries.regionId, regions.id))
      .leftJoin(subregions, eq(countries.subregionId, subregions.id));

    if (conditions.length > 0) {
      baseQuery.where(and(...conditions));
    }

    const results = await baseQuery;

    return {
      totalCities: results.length,
      totalStates: new Set(results.map((r) => r.states?.id).filter(Boolean))
        .size,
      totalCountries: new Set(
        results.map((r) => r.countries?.id).filter(Boolean)
      ).size,
      totalRegions: new Set(results.map((r) => r.regions?.id).filter(Boolean))
        .size,
    };
  },
};
