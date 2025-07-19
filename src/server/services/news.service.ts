import { NewsFilters } from "@/types/query-filter";
import { and, asc, desc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";
import db from "../database";
import {
  NewNews,
  news,
  newsDetails,
  newsLocation,
  newsSource,
  UpdateNews,
  countries,
  states,
  cities,
} from "../schemas";
import slugify from "slugify";

export interface UpdateNewsData {
  title?: string;
  slug?: string;
  summary?: string;
  sourceId?: string;
  locationId?: string;
}

export const NewsService = {
  async findAll(filter: NewsFilters = {}) {
    const {
      limit = 20,
      page = 1,
      orderBy = "createdAt",
      order = "desc",
      search,
      sourceId,
      locationId,
    } = filter;

    const orderColumns = {
      title: news.title,
      createdAt: news.createdAt,
      updatedAt: news.updatedAt,
    };

    let query = db
      .select({
        id: news.id,
        title: news.title,
        slug: news.slug,
        summary: news.summary,
        sourceId: news.sourceId,
        locationId: news.locationId,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
        source: {
          id: newsSource.id,
          name: newsSource.name,
          domain: newsSource.domain,
          credibilityScore: newsSource.credibilityScore,
        },
        location: {
          id: newsLocation.id,
          name: newsLocation.name,
          description: newsLocation.description,
          latitude: newsLocation.latitude,
          longitude: newsLocation.longitude,
        },
      })
      .from(news)
      .leftJoin(newsSource, eq(news.sourceId, newsSource.id))
      .leftJoin(newsLocation, eq(news.locationId, newsLocation.id));

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(
        sql`${news.title} ILIKE ${"%" + search + "%"} OR ${
          news.summary
        } ILIKE ${"%" + search + "%"}`
      );
    }
    if (sourceId) conditions.push(eq(news.sourceId, sourceId));
    if (locationId) conditions.push(eq(news.locationId, locationId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return await query
      .orderBy(
        order === "desc"
          ? desc(orderColumns[orderBy as keyof typeof orderColumns])
          : asc(orderColumns[orderBy as keyof typeof orderColumns])
      )
      .limit(limit)
      .offset((page - 1) * limit);
  },

  async findOne(id: string) {
    const [result] = await db
      .select({
        id: news.id,
        title: news.title,
        slug: news.slug,
        summary: news.summary,
        sourceId: news.sourceId,
        locationId: news.locationId,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
        source: {
          id: newsSource.id,
          name: newsSource.name,
          domain: newsSource.domain,
          credibilityScore: newsSource.credibilityScore,
        },
        location: {
          id: newsLocation.id,
          name: newsLocation.name,
          description: newsLocation.description,
          latitude: newsLocation.latitude,
          longitude: newsLocation.longitude,
        },
      })
      .from(news)
      .leftJoin(newsSource, eq(news.sourceId, newsSource.id))
      .leftJoin(newsLocation, eq(news.locationId, newsLocation.id))
      .where(eq(news.id, id))
      .limit(1);

    return result || null;
  },

  async findBySlug(slug: string) {
    const [result] = await db
      .select({
        id: news.id,
        title: news.title,
        slug: news.slug,
        summary: news.summary,
        sourceId: news.sourceId,
        locationId: news.locationId,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
        source: {
          id: newsSource.id,
          name: newsSource.name,
          domain: newsSource.domain,
          credibilityScore: newsSource.credibilityScore,
        },
        location: {
          id: newsLocation.id,
          name: newsLocation.name,
          description: newsLocation.description,
          latitude: newsLocation.latitude,
          longitude: newsLocation.longitude,
        },
      })
      .from(news)
      .leftJoin(newsSource, eq(news.sourceId, newsSource.id))
      .leftJoin(newsLocation, eq(news.locationId, newsLocation.id))
      .where(eq(news.slug, slug))
      .limit(1);

    return result || null;
  },

  async create(data: NewNews) {
    return await db.transaction(async (tx) => {
      try {
        // Handle location creation if provided
        let locationId = (data as any).locationId;
        if (data.location && !locationId) {
          locationId = await this.handleLocation(data.location, tx);
        }

        // Generate slug from title
        const slug = slugify(data.title, { lower: true });

        // Create news record
        const [result] = await tx
          .insert(news)
          .values({
            title: data.title,
            slug,
            summary: data.summary,
            sourceId: data.sourceId,
            locationId,
          })
          .returning();

        return result;
      } catch (error) {
        console.error("Error creating news:", error);
        throw new Error("Failed to create news article");
      }
    });
  },

  async update(id: string, data: UpdateNews) {
    return await db.transaction(async (tx) => {
      try {
        // Check if news exists
        const [existingNews] = await tx
          .select()
          .from(news)
          .where(eq(news.id, id));

        if (!existingNews) {
          throw new Error("News article not found");
        }

        let locationId = existingNews.locationId;

        // Handle location update if provided
        if (data.location) {
          locationId = await this.handleLocation(data.location, tx);
        }

        // Prepare update data
        const updateData: any = {
          ...data,
          locationId,
          updatedAt: new Date(),
        };

        // Generate new slug if title is being updated
        if (data.title) {
          updateData.slug = slugify(data.title, { lower: true });
        }

        // Remove location from update data as it's handled separately
        delete updateData.location;

        // Update news record
        const [result] = await tx
          .update(news)
          .set(updateData)
          .where(eq(news.id, id))
          .returning();

        return result;
      } catch (error) {
        console.error("Error updating news:", error);
        throw new Error("Failed to update news article");
      }
    });
  },

  async delete(id: string) {
    try {
      const [result] = await db.delete(news).where(eq(news.id, id)).returning();

      if (!result) {
        throw new Error("News article not found");
      }

      return result;
    } catch (error) {
      console.error("Error deleting news:", error);
      throw new Error("Failed to delete news article");
    }
  },

  // Query Methods
  async findBySource(sourceId: string, limit = 10) {
    return await db
      .select({
        id: news.id,
        title: news.title,
        slug: news.slug,
        summary: news.summary,
        createdAt: news.createdAt,
        source: {
          id: newsSource.id,
          name: newsSource.name,
          domain: newsSource.domain,
          credibilityScore: newsSource.credibilityScore,
        },
      })
      .from(news)
      .leftJoin(newsSource, eq(news.sourceId, newsSource.id))
      .where(eq(news.sourceId, sourceId))
      .orderBy(desc(news.createdAt))
      .limit(limit);
  },

  async findByLocation(locationId: string, limit = 10) {
    return await db
      .select({
        id: news.id,
        title: news.title,
        slug: news.slug,
        summary: news.summary,
        createdAt: news.createdAt,
        location: {
          id: newsLocation.id,
          name: newsLocation.name,
          latitude: newsLocation.latitude,
          longitude: newsLocation.longitude,
        },
      })
      .from(news)
      .leftJoin(newsLocation, eq(news.locationId, newsLocation.id))
      .where(eq(news.locationId, locationId))
      .orderBy(desc(news.createdAt))
      .limit(limit);
  },

  async getWithDetails(newsIdOrSlug: string) {
    const [result] = await db
      .select()
      .from(news)
      .leftJoin(newsSource, eq(news.sourceId, newsSource.id))
      .leftJoin(newsLocation, eq(news.locationId, newsLocation.id))
      .leftJoin(newsDetails, eq(news.id, newsDetails.sourceId))
      .where(or(eq(news.id, newsIdOrSlug), eq(news.slug, newsIdOrSlug)))
      .limit(1);

    return result || null;
  },

  async getByDateRange(startDate: Date, endDate: Date) {
    return await db
      .select()
      .from(news)
      .leftJoin(newsSource, eq(news.sourceId, newsSource.id))
      .where(and(gte(news.createdAt, startDate), lte(news.createdAt, endDate)))
      .orderBy(desc(news.createdAt));
  },

  // Analytics
  async getStats() {
    const [stats] = await db
      .select({
        totalNews: sql<number>`COUNT(${news.id})`,
        uniqueSources: sql<number>`COUNT(DISTINCT ${news.sourceId})`,
        uniqueLocations: sql<number>`COUNT(DISTINCT ${news.locationId})`,
        latestNews: sql<Date>`MAX(${news.createdAt})`,
      })
      .from(news);

    return stats;
  },

  async getSourceStats(limit = 10) {
    return await db
      .select({
        sourceId: news.sourceId,
        sourceName: newsSource.name,
        sourceDomain: newsSource.domain,
        credibilityScore: newsSource.credibilityScore,
        newsCount: sql<number>`COUNT(${news.id})`,
        latestNews: sql<Date>`MAX(${news.createdAt})`,
      })
      .from(news)
      .leftJoin(newsSource, eq(news.sourceId, newsSource.id))
      .groupBy(
        news.sourceId,
        newsSource.name,
        newsSource.domain,
        newsSource.credibilityScore
      )
      .orderBy(desc(sql<number>`COUNT(${news.id})`))
      .limit(limit);
  },

  // Utilities
  async count(filter: NewsFilters = {}) {
    const { search, sourceId, locationId } = filter;

    let query = db.select({ count: sql<number>`COUNT(*)` }).from(news);

    const conditions = [];
    if (search) {
      conditions.push(
        sql`${news.title} ILIKE ${"%" + search + "%"} OR ${
          news.summary
        } ILIKE ${"%" + search + "%"}`
      );
    }
    if (sourceId) conditions.push(eq(news.sourceId, sourceId));
    if (locationId) conditions.push(eq(news.locationId, locationId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const [result] = await query;
    return result.count;
  },

  async bulkDelete(ids: string[]) {
    return await db.delete(news).where(inArray(news.id, ids)).returning();
  },

  // Helper method to handle location creation/finding
  async handleLocation(locationData: any, tx: any): Promise<string> {
    try {
      // First, handle country
      let countryId: number | null = null;
      if (locationData.country) {
        const [existingCountry] = await tx
          .select()
          .from(countries)
          .where(eq(countries.name, locationData.country.name));

        if (existingCountry) {
          countryId = existingCountry.id;
        } else {
          const [newCountry] = await tx
            .insert(countries)
            .values(locationData.country)
            .returning();
          countryId = newCountry.id;
        }
      }

      // Handle state
      let stateId: number | null = null;
      if (locationData.state && countryId) {
        const [existingState] = await tx
          .select()
          .from(states)
          .where(
            and(
              eq(states.name, locationData.state.name),
              eq(states.countryId, countryId)
            )
          );

        if (existingState) {
          stateId = existingState.id;
        } else {
          const [newState] = await tx
            .insert(states)
            .values({
              ...locationData.state,
              countryId,
            })
            .returning();
          stateId = newState.id;
        }
      }

      // Handle city
      let cityId: number | null = null;
      if (locationData.city && stateId && countryId) {
        const [existingCity] = await tx
          .select()
          .from(cities)
          .where(
            and(
              eq(cities.name, locationData.city.name),
              eq(cities.stateId, stateId),
              eq(cities.countryId, countryId)
            )
          );

        if (existingCity) {
          cityId = existingCity.id;
        } else {
          const [newCity] = await tx
            .insert(cities)
            .values({
              ...locationData.city,
              stateId,
              countryId,
            })
            .returning();
          cityId = newCity.id;
        }
      }

      // Create or find news location
      const newsLocationData = {
        name: locationData.name,
        description: locationData.description,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        countryId,
        stateId,
        cityId,
      };

      // Try to find existing news location
      const [existingLocation] = await tx
        .select()
        .from(newsLocation)
        .where(
          and(
            eq(newsLocation.latitude, newsLocationData.latitude || "0"),
            eq(newsLocation.longitude, newsLocationData.longitude || "0"),
            eq(newsLocation.name, newsLocationData.name || "")
          )
        );

      if (existingLocation) {
        return existingLocation.id;
      }

      // Create new news location
      const [newLocation] = await tx
        .insert(newsLocation)
        .values(newsLocationData)
        .returning();

      return newLocation.id;
    } catch (error) {
      console.error("Error handling location:", error);
      throw new Error("Failed to handle location data");
    }
  },

  // Enhanced methods with full location data
  async findOneWithFullLocation(id: string) {
    const [result] = await db
      .select({
        id: news.id,
        title: news.title,
        slug: news.slug,
        summary: news.summary,
        sourceId: news.sourceId,
        locationId: news.locationId,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
        source: {
          id: newsSource.id,
          name: newsSource.name,
          domain: newsSource.domain,
          credibilityScore: newsSource.credibilityScore,
        },
        location: {
          id: newsLocation.id,
          name: newsLocation.name,
          description: newsLocation.description,
          latitude: newsLocation.latitude,
          longitude: newsLocation.longitude,
        },
        country: {
          id: countries.id,
          name: countries.name,
          iso3: countries.iso3,
          iso2: countries.iso2,
        },
        state: {
          id: states.id,
          name: states.name,
          countryCode: states.countryCode,
        },
        city: {
          id: cities.id,
          name: cities.name,
          stateCode: cities.stateCode,
          countryCode: cities.countryCode,
        },
      })
      .from(news)
      .leftJoin(newsSource, eq(news.sourceId, newsSource.id))
      .leftJoin(newsLocation, eq(news.locationId, newsLocation.id))
      .leftJoin(countries, eq(newsLocation.countryId, countries.id))
      .leftJoin(states, eq(newsLocation.stateId, states.id))
      .leftJoin(cities, eq(newsLocation.cityId, cities.id))
      .where(eq(news.id, id))
      .limit(1);

    return result || null;
  },

  async findBySlugWithFullLocation(slug: string) {
    const [result] = await db
      .select({
        id: news.id,
        title: news.title,
        slug: news.slug,
        summary: news.summary,
        sourceId: news.sourceId,
        locationId: news.locationId,
        createdAt: news.createdAt,
        updatedAt: news.updatedAt,
        source: {
          id: newsSource.id,
          name: newsSource.name,
          domain: newsSource.domain,
          credibilityScore: newsSource.credibilityScore,
        },
        location: {
          id: newsLocation.id,
          name: newsLocation.name,
          description: newsLocation.description,
          latitude: newsLocation.latitude,
          longitude: newsLocation.longitude,
        },
        country: {
          id: countries.id,
          name: countries.name,
          iso3: countries.iso3,
          iso2: countries.iso2,
        },
        state: {
          id: states.id,
          name: states.name,
          countryCode: states.countryCode,
        },
        city: {
          id: cities.id,
          name: cities.name,
          stateCode: cities.stateCode,
          countryCode: cities.countryCode,
        },
      })
      .from(news)
      .leftJoin(newsSource, eq(news.sourceId, newsSource.id))
      .leftJoin(newsLocation, eq(news.locationId, newsLocation.id))
      .leftJoin(countries, eq(newsLocation.countryId, countries.id))
      .leftJoin(states, eq(newsLocation.stateId, states.id))
      .leftJoin(cities, eq(newsLocation.cityId, cities.id))
      .where(eq(news.slug, slug))
      .limit(1);

    return result || null;
  },
};
